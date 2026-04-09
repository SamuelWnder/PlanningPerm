declare module "html-to-pdfmake" {
  function htmlToPdfmake(
    html: string,
    options?: Record<string, unknown>
  ): unknown[];
  export default htmlToPdfmake;
}
