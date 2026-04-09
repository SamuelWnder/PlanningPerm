/**
 * Isolated pdfmake setup module.
 * Static imports here ensure the CJS vfs_fonts side-effects fire correctly
 * even when this module is loaded via dynamic import().
 */
import pdfMake from "pdfmake/build/pdfmake";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfFonts = require("pdfmake/build/vfs_fonts");

// Attach fonts to the pdfmake instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = pdfFonts?.pdfMake?.vfs ?? pdfFonts?.default?.pdfMake?.vfs ?? pdfFonts;

export { pdfMake };
