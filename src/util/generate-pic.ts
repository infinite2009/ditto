import html2canvas from "html2canvas";

export async function generatePicByElement(ele: HTMLElement, {
  filename = 'index.png',
  scale = 1
}: { filename?: string; scale?: number }) {
  // TODO：已隐藏元素的截图
  return new Promise<File | undefined>((resolve, reject) => {
    if (!ele) {
      resolve(undefined);
      return;
    }

    html2canvas(ele, { scale }).then(canvas => {
      canvas.toBlob(async blob => {
        if (blob) {
          const file = new File([blob], filename, { type: 'image/png' });
          resolve(file);
        } else {
          resolve(undefined);
        }
      });
    });
  });
}