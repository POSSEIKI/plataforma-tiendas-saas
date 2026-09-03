import * as XLSX from 'xlsx';
import { Product, Category } from '../types';

export interface ParsedInventoryItem {
  row_number: number;
  nombre: string;
  codigo_barras: string;
  marca: string;
  categoria: string;
  presentacion: string;
  principio_activo?: string;
  precio: number;
  existencia_total: number;
  tiene_inventario: boolean;
  imagenUrl?: string;
  descripcion?: string;
  // 🔹 Fractionated & Multi-Stock Columns
  maneja_fracciones?: boolean;
  stock_caja?: number;
  stock_blister?: number;
  stock_unidad?: number;
  contenido_caja?: number;
  contenido_blister?: number;
  precio_caja?: number;
  precio_blister?: number;
  precio_unidad?: number;
}

export interface ColumnMapping {
  colNombre: number;
  colCodigo: number;
  colMarca: number;
  colCategoria: number;
  colPresentacion: number;
  colPrincipioActivo: number;
  colPrecio: number;
  colStock: number;
  // 🔹 Multi-stock columns (Caja, Blíster, Unidad)
  colStockCaja: number;
  colStockBlister: number;
  colStockUnidad: number;
  // 🔹 Multi-content multipliers
  colContenidoCaja: number;
  colContenidoBlister: number;
  // 🔹 Multi-price columns
  colPrecioCaja: number;
  colPrecioBlister: number;
  colPrecioUnidad: number;
  colImagen: number;
}

export interface InventoryReadResult {
  productos: ParsedInventoryItem[];
  categoriasExtraidas: string[];
  columnasDetectadas: string[];
  rawRows: any[][];
  mapping: ColumnMapping;
  formatoArchivo: string;
  totalFilasLeidas: number;
  totalProductosValidos: number;
}

export class ExcelReader {
  // Normalizes header string: removes accents, symbols, whitespace
  private normalizeHeader(header: string): string {
    return (header || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Parse Colombian / Latin currency and number strings cleanly
  public parseNumber(val: any): number {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    
    let str = String(val).trim();
    str = str.replace(/[\$\s"']/g, '');

    if (str.includes('.') && str.includes(',')) {
      if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      const parts = str.split(',');
      if (parts[parts.length - 1].length === 3) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(',', '.');
      }
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts[parts.length - 1].length === 3 && parts.length > 1) {
        str = str.replace(/\./g, '');
      }
    }

    const num = parseFloat(str.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  // Detect delimiter for plain text files (.txt / .csv)
  private detectDelimiter(sampleLines: string[]): string {
    const text = sampleLines.slice(0, 15).join('\n');
    const counts = {
      '|': (text.match(/\|/g) || []).length,
      ';': (text.match(/;/g) || []).length,
      '\t': (text.match(/\t/g) || []).length,
      ',': (text.match(/,/g) || []).length,
    };

    let bestDelim = '|';
    let maxCount = 0;
    for (const [delim, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        bestDelim = delim;
      }
    }
    return maxCount > 0 ? bestDelim : '|';
  }

  // Parse plain text files with encoding fallback (UTF-8 / Latin-1 / Windows-1252)
  private parseTextFile(buffer: ArrayBuffer, fileName: string): string[][] {
    let text = '';
    try {
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
      text = utf8Decoder.decode(buffer);
    } catch {
      const latin1Decoder = new TextDecoder('windows-1252');
      text = latin1Decoder.decode(buffer);
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const cleanLines = lines.filter(line => {
      if (/^[-=_*]{3,}$/.test(line)) return false;
      if (/^pagina\s*\d+/i.test(line)) return false;
      if (/^fecha:\s*\d+/i.test(line)) return false;
      if (/^hora:\s*\d+/i.test(line)) return false;
      return true;
    });

    const delim = this.detectDelimiter(cleanLines);
    const matrix: string[][] = [];

    for (const line of cleanLines) {
      const parts = line.split(delim).map(p => p.replace(/^["']|["']$/g, '').trim());
      if (parts.length > 1 || (parts.length === 1 && parts[0].length > 0)) {
        matrix.push(parts);
      }
    }

    return matrix;
  }

  // Smart column finder that avoids constant/type columns and picks the best match
  private findBestColumn(
    headers: string[], 
    rawRows: any[][], 
    headerIdx: number, 
    priorityAliases: string[], 
    excludeTerms: string[] = []
  ): number {
    const normalizedHeaders = headers.map(h => this.normalizeHeader(h));

    // Phase 1: Exact matches
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const norm = normalizedHeaders[i];
      if (excludeTerms.some(ex => norm.includes(ex))) continue;

      for (const alias of priorityAliases) {
        if (norm === alias) {
          return i;
        }
      }
    }

    // Phase 2: Substring matches (with exclusions)
    for (let i = 0; i < normalizedHeaders.length; i++) {
      const norm = normalizedHeaders[i];
      if (excludeTerms.some(ex => norm.includes(ex))) continue;

      for (const alias of priorityAliases) {
        if (norm.includes(alias)) {
          return i;
        }
      }
    }

    return -1;
  }

  // Detects the column that actually contains product descriptions by checking variance
  private detectNameColumnByVariance(rawRows: any[][], startRow: number, headers: string[]): number {
    const numCols = Math.max(...rawRows.slice(startRow, startRow + 50).map(r => r.length), 0);
    let bestCol = -1;
    let maxVarianceScore = -1;

    for (let c = 0; c < numCols; c++) {
      const header = headers[c] ? this.normalizeHeader(headers[c]) : '';
      if (header.includes('tipo') || header.includes('clase') || header.includes('id') || header.includes('codigo')) {
        continue;
      }

      const values = new Set<string>();
      let totalLength = 0;
      let stringCount = 0;

      const sample = rawRows.slice(startRow, startRow + 50);
      for (const row of sample) {
        const val = row[c];
        if (typeof val === 'string' && val.trim().length > 2 && isNaN(Number(val))) {
          const clean = val.trim().toUpperCase();
          if (clean !== 'PRODUCTO' && clean !== 'SERVICIO' && clean !== 'ACTIVO') {
            values.add(clean);
            totalLength += clean.length;
            stringCount++;
          }
        }
      }

      // Variance score = unique count * avg length
      if (stringCount > 5) {
        const avgLen = totalLength / stringCount;
        const score = values.size * avgLen;
        if (score > maxVarianceScore) {
          maxVarianceScore = score;
          bestCol = c;
        }
      }
    }

    return bestCol !== -1 ? bestCol : 0;
  }

  /**
   * Main entry point: Reads any Excel or Text and detects optimal mapping
   */
  public async readFile(file: File): Promise<InventoryReadResult> {
    const buffer = await file.arrayBuffer();
    const ext = file.name.toLowerCase().split('.').pop() || '';
    let rawRows: any[][] = [];
    let formatLabel = ext.toUpperCase();

    if (ext === 'txt' || ext === 'prn' || ext === 'tsv') {
      rawRows = this.parseTextFile(buffer, file.name);
      formatLabel = `Texto Plano (.${ext})`;
    } else {
      try {
        const workbook = XLSX.read(buffer, {
          type: 'array',
          raw: false,
          cellDates: false,
          codepage: 1252,
        });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error('El archivo no contiene hojas de datos.');

        const sheet = workbook.Sheets[sheetName];
        rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });
        formatLabel = ext === 'xls' ? 'Excel Antiguo (.xls)' : `Excel (.${ext})`;
      } catch (excelErr) {
        rawRows = this.parseTextFile(buffer, file.name);
        formatLabel = 'Texto / CSV (Recuperado)';
      }
    }

    if (rawRows.length === 0) {
      throw new Error('El archivo está vacío o no se pudieron extraer filas.');
    }

    // Find header row
    let headerRowIndex = 0;
    while (headerRowIndex < Math.min(10, rawRows.length)) {
      const row = rawRows[headerRowIndex];
      if (row && row.length >= 2) {
        const textCount = row.filter((c: any) => typeof c === 'string' && isNaN(Number(c)) && c.trim().length > 1).length;
        if (textCount >= 2) {
          break;
        }
      }
      headerRowIndex++;
    }

    if (headerRowIndex >= rawRows.length) {
      headerRowIndex = 0;
    }

    const headers: string[] = (rawRows[headerRowIndex] || []).map((h: any) => String(h || '').trim());

    // 1. Column for Name
    let colNombre = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['descripcion_larga', 'descripcion_producto', 'descripcion', 'desc_corta', 'desc', 'nombre_producto', 'nombre_articulo', 'nombre', 'articulo', 'detalle', 'item_name', 'item'],
      ['tipo', 'clase', 'id_tipo', 'tipo_item', 'tipo_producto']
    );

    if (colNombre === -1) {
      colNombre = this.detectNameColumnByVariance(rawRows, headerRowIndex + 1, headers);
    }

    // 2. Column for Barcode / Code / SKU
    let colCodigo = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['codigo_barras', 'cod_barras', 'ean', 'barcode', 'codbar', 'plu', 'sku', 'codigo_producto', 'cod_art', 'codigo', 'cod', 'referencia', 'ref']
    );

    // 3. Column for Principle Active / Sustancia
    let colPrincipioActivo = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['principio_activo', 'sustancia', 'componente', 'generico', 'molecula', 'droga', 'principio', 'droga_farmaco']
    );

    // 4. Column for Base Price
    let colPrecio = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['precio_venta', 'precio_1', 'precio1', 'pvp', 'precio_publico', 'precio_unitario', 'valor_unitario', 'p_venta', 'val_uni', 'precio', 'valor', 'price']
    );

    // 5. Column for Stock / Quantity (General)
    let colStock = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['existencia_total', 'existencia', 'saldo_actual', 'saldo', 'stock_actual', 'stock', 'cantidad', 'cant', 'unidades', 'inv', 'qty', 'sal_act', 'exist']
    );

    // 🔹 6. 3-Column Multi-Stock (Caja, Blíster, Unidad)
    let colStockCaja = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['stock_caja', 'existencia_caja', 'cant_caja', 'cajas_stock', 'saldo_caja', 'inv_caja', 'cajas']
    );

    let colStockBlister = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['stock_blister', 'existencia_blister', 'cant_blister', 'blister_stock', 'saldo_blister', 'inv_blister', 'blister', 'blisters']
    );

    let colStockUnidad = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['stock_unidad', 'existencia_unidad', 'cant_unidad', 'unidad_stock', 'saldo_unidad', 'inv_unidad', 'fraccion', 'fracciones', 'pastillas', 'sueltas']
    );

    // 🔹 7. Multi-Content Multipliers (x Caja, x Blíster)
    let colContenidoCaja = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['contenido_caja', 'unidades_caja', 'cant_x_caja', 'factor_caja', 'x_caja', 'unidades_por_caja', 'fraccion_caja']
    );

    let colContenidoBlister = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['contenido_blister', 'unidades_blister', 'cant_x_blister', 'factor_blister', 'x_blister', 'unidades_por_blister', 'fraccion_blister']
    );

    // 🔹 8. Multi-Price Columns (Precio Caja, Precio Blíster, Precio Unidad)
    let colPrecioCaja = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['precio_caja', 'valor_caja', 'pvp_caja', 'precio_cajas', 'precio1']
    );

    let colPrecioBlister = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['precio_blister', 'valor_blister', 'pvp_blister', 'precio_blisters', 'precio2']
    );

    let colPrecioUnidad = this.findBestColumn(
      headers,
      rawRows,
      headerRowIndex,
      ['precio_unidad', 'valor_unidad', 'precio_fraccion', 'pvp_unidad', 'precio_pastilla', 'precio3']
    );

    // 9. Column for Category / Group
    let colCategoria = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['categoria', 'nom_cat', 'grupo', 'nom_gru', 'linea', 'nom_lin', 'subgrupo', 'familia', 'nom_fam', 'departamento', 'seccion', 'category']
    );

    // 10. Column for Brand / Lab
    let colMarca = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['marca', 'nom_marca', 'laboratorio', 'nom_lab', 'fabricante', 'proveedor', 'brand']
    );

    // 11. Column for Presentation / Unit
    let colPresentacion = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['presentacion', 'unidad_medida', 'unidad', 'unimed', 'empaque', 'medida', 'envase', 'forma']
    );

    // 12. Column for Image
    let colImagen = this.findBestColumn(
      headers, 
      rawRows, 
      headerRowIndex,
      ['imagen', 'foto', 'image', 'url_imagen', 'img', 'imagen_url']
    );

    const mapping: ColumnMapping = {
      colNombre,
      colCodigo,
      colMarca,
      colCategoria,
      colPresentacion,
      colPrincipioActivo,
      colPrecio,
      colStock,
      colStockCaja,
      colStockBlister,
      colStockUnidad,
      colContenidoCaja,
      colContenidoBlister,
      colPrecioCaja,
      colPrecioBlister,
      colPrecioUnidad,
      colImagen,
    };

    const { productos, categoriasExtraidas } = this.processRowsWithMapping(rawRows, headerRowIndex, mapping);

    return {
      productos,
      categoriasExtraidas,
      columnasDetectadas: headers,
      rawRows,
      mapping,
      formatoArchivo: formatLabel,
      totalFilasLeidas: rawRows.length - (headerRowIndex + 1),
      totalProductosValidos: productos.length,
    };
  }

  /**
   * Processes rows given a specific mapping (supports manual re-mapping from UI)
   */
  public processRowsWithMapping(
    rawRows: any[][], 
    headerRowIndex: number, 
    mapping: ColumnMapping
  ): { productos: ParsedInventoryItem[]; categoriasExtraidas: string[] } {
    const productos: ParsedInventoryItem[] = [];
    const categoriasSet = new Set<string>();

    for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
      const row = rawRows[r];
      if (!row || row.length === 0) continue;

      // Extract Name
      const rawNombre = mapping.colNombre !== -1 && row[mapping.colNombre] !== undefined 
        ? String(row[mapping.colNombre]).trim() 
        : '';

      if (!rawNombre || rawNombre === 'undefined' || rawNombre === 'null' || /^[-=_*]{2,}$/.test(rawNombre)) {
        continue;
      }

      // Extract Code / Barcode (Exact from file or empty string)
      let rawCodigo = '';
      if (mapping.colCodigo !== -1 && row[mapping.colCodigo] !== undefined && row[mapping.colCodigo] !== '') {
        rawCodigo = String(row[mapping.colCodigo]).trim().replace(/['"]/g, '');
      }

      // Extract Brand / Lab
      const rawMarca = mapping.colMarca !== -1 && row[mapping.colMarca] ? String(row[mapping.colMarca]).trim() : '';

      // Extract Principle Active / Sustancia
      const rawPrincipio = mapping.colPrincipioActivo !== -1 && row[mapping.colPrincipioActivo] 
        ? String(row[mapping.colPrincipioActivo]).trim() 
        : '';

      // Extract Category
      let rawCat = mapping.colCategoria !== -1 && row[mapping.colCategoria] ? String(row[mapping.colCategoria]).trim() : '';
      if (!rawCat || rawCat === '0' || rawCat === '-' || rawCat === 'undefined') {
        rawCat = 'GENERAL';
      }
      categoriasSet.add(rawCat.toUpperCase());

      // Extract Presentation
      let rawPres = mapping.colPresentacion !== -1 && row[mapping.colPresentacion] ? String(row[mapping.colPresentacion]).trim().toUpperCase() : 'UNIDAD';
      if (!rawPres) rawPres = 'UNIDAD';

      // Extract Base Price
      let priceVal = 0;
      if (mapping.colPrecio !== -1 && row[mapping.colPrecio] !== undefined) {
        priceVal = this.parseNumber(row[mapping.colPrecio]);
      } else {
        // Look for numbers in row
        for (let c = 0; c < row.length; c++) {
          if (c !== mapping.colCodigo && c !== mapping.colNombre) {
            const val = this.parseNumber(row[c]);
            if (val > 100) {
              priceVal = val;
              break;
            }
          }
        }
      }

      // 🔹 Fractionated Multipliers (Contenido Caja / Blíster)
      let factorCaja = mapping.colContenidoCaja !== -1 && row[mapping.colContenidoCaja] !== undefined
        ? Math.round(this.parseNumber(row[mapping.colContenidoCaja]))
        : 24;
      if (factorCaja <= 0) factorCaja = 24;

      let factorBlister = mapping.colContenidoBlister !== -1 && row[mapping.colContenidoBlister] !== undefined
        ? Math.round(this.parseNumber(row[mapping.colContenidoBlister]))
        : 6;
      if (factorBlister <= 0) factorBlister = 6;

      // 🔹 3-Column Stock Calculation (Caja, Blíster, Unidad)
      const hasStockCaja = mapping.colStockCaja !== -1 && row[mapping.colStockCaja] !== undefined;
      const hasStockBlister = mapping.colStockBlister !== -1 && row[mapping.colStockBlister] !== undefined;
      const hasStockUnidad = mapping.colStockUnidad !== -1 && row[mapping.colStockUnidad] !== undefined;

      const numStockCaja = hasStockCaja ? this.parseNumber(row[mapping.colStockCaja]) : 0;
      const numStockBlister = hasStockBlister ? this.parseNumber(row[mapping.colStockBlister]) : 0;
      const numStockUnidad = hasStockUnidad ? this.parseNumber(row[mapping.colStockUnidad]) : 0;

      let totalBaseStock = 0;
      const hasMultiStockColumns = hasStockCaja || hasStockBlister || hasStockUnidad;

      if (hasMultiStockColumns) {
        // 🧮 Total Base Units = (Cajas * Unidades_por_Caja) + (Blisters * Unidades_por_Blister) + Unidades_Sueltas
        totalBaseStock = Math.round((numStockCaja * factorCaja) + (numStockBlister * factorBlister) + numStockUnidad);
        if (totalBaseStock < 0) totalBaseStock = 0;
      } else if (mapping.colStock !== -1 && row[mapping.colStock] !== undefined) {
        totalBaseStock = Math.round(this.parseNumber(row[mapping.colStock]));
        if (totalBaseStock < 0) totalBaseStock = 0;
      } else {
        totalBaseStock = 10;
      }

      // 🔹 Fractionated Prices
      const priceCaja = mapping.colPrecioCaja !== -1 && row[mapping.colPrecioCaja] !== undefined
        ? this.parseNumber(row[mapping.colPrecioCaja])
        : priceVal;

      const priceBlister = mapping.colPrecioBlister !== -1 && row[mapping.colPrecioBlister] !== undefined
        ? this.parseNumber(row[mapping.colPrecioBlister])
        : (priceVal > 0 ? Math.round(priceVal / 4) : undefined);

      const priceUnidad = mapping.colPrecioUnidad !== -1 && row[mapping.colPrecioUnidad] !== undefined
        ? this.parseNumber(row[mapping.colPrecioUnidad])
        : (priceVal > 0 ? Math.round(priceVal / factorCaja) : undefined);

      // Determine if fractionated
      const isFraccionado = hasMultiStockColumns || 
        (mapping.colPrecioBlister !== -1 && row[mapping.colPrecioBlister] !== undefined) ||
        (mapping.colPrecioUnidad !== -1 && row[mapping.colPrecioUnidad] !== undefined);

      // Extract Image
      const rawImg = mapping.colImagen !== -1 && row[mapping.colImagen] && String(row[mapping.colImagen]).startsWith('http')
        ? String(row[mapping.colImagen]).trim()
        : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80';

      const item: ParsedInventoryItem = {
        row_number: r + 1,
        nombre: rawNombre.toUpperCase(),
        codigo_barras: rawCodigo,
        marca: rawMarca,
        categoria: rawCat.toUpperCase(),
        presentacion: rawPres,
        principio_activo: rawPrincipio || undefined,
        precio: priceVal,
        existencia_total: totalBaseStock,
        tiene_inventario: totalBaseStock > 0,
        imagenUrl: rawImg,
        descripcion: rawMarca ? `Marca / Laboratorio: ${rawMarca}` : undefined,
        maneja_fracciones: isFraccionado,
        stock_caja: hasStockCaja ? numStockCaja : undefined,
        stock_blister: hasStockBlister ? numStockBlister : undefined,
        stock_unidad: hasStockUnidad ? numStockUnidad : undefined,
        contenido_caja: factorCaja,
        contenido_blister: factorBlister,
        precio_caja: priceCaja || priceVal,
        precio_blister: priceBlister,
        precio_unidad: priceUnidad,
      };

      productos.push(item);
    }

    return {
      productos,
      categoriasExtraidas: Array.from(categoriasSet),
    };
  }

  /**
   * Helper to convert parsed items into application Store Product format
   */
  public toStoreProducts(parsedItems: ParsedInventoryItem[]): { products: Product[]; categories: Category[] } {
    const categoryMap = new Map<string, string>();
    const categories: Category[] = [];

    parsedItems.forEach(item => {
      const catName = item.categoria || 'GENERAL';
      if (!categoryMap.has(catName)) {
        const catId = 'cat-' + catName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        categoryMap.set(catName, catId);
        categories.push({
          id: catId,
          nombre: catName,
          icono: 'Tag',
          activo: true,
        });
      }
    });

    const products: Product[] = parsedItems.map((item, idx) => ({
      id: 'prod-imp-' + (Date.now() + idx),
      nombre: item.nombre,
      descripcion: item.descripcion,
      principioActivo: item.principio_activo,
      laboratorio: item.marca || undefined,
      precio: item.precio,
      stock: item.existencia_total,
      codigoBarras: item.codigo_barras,
      categoriaId: categoryMap.get(item.categoria) || 'cat-general',
      presentacion: item.presentacion,
      imagenUrl: item.imagenUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80',
      activo: true,
      // 🔹 Fractionated Inventory Fields
      manejaFracciones: item.maneja_fracciones,
      contenidoCaja: item.contenido_caja || 24,
      contenidoBlister: item.contenido_blister || 6,
      precioCaja: item.precio_caja || item.precio,
      precioBlister: item.precio_blister,
      precioUnidad: item.precio_unidad,
    }));

    return { products, categories };
  }
}

export const excelReader = new ExcelReader();

