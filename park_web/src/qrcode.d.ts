declare module "qrcode" {
  interface QRCodeApi {
    toDataURL(
      text: string,
      options?: {
        margin?: number;
        width?: number;
        color?: { dark?: string; light?: string };
      },
    ): Promise<string>;
  }
  const qrcode: QRCodeApi;
  export default qrcode;
}
