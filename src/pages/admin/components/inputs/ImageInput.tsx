import { Icon } from '@/components/icon';
import NewFileManager from '@/service/new-file-manager';

async function uploadCover() {
  const file = await selectImageFile();
  if (!file) {
    return;
  }
  const url = await NewFileManager.uploadImageToBfs(file);
  return url;
}

async function selectImageFile(): Promise<File | null> {
  try {
    // 优先使用 showOpenFilePicker
    if ('showOpenFilePicker' in window) {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
            }
          }
        ],
        multiple: false
      });

      const file = await fileHandle.getFile();
      return file;
    }

    // 兜底方案：使用 input 元素
    return new Promise(resolve => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = e => {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };

      input.oncancel = () => {
        resolve(null);
      };

      // 触发文件选择
      input.click();
    });
  } catch (error) {
    console.error('选择文件时发生错误:', error);
    return null;
  }
}

export function ImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const handleClick = async () => {
    const url = await uploadCover();
    if (url) {
      onChange(url);
    }
  };
  return (
    <div className="w-108 h-132 flex-shrink-0 flex flex-col gap-8 items-center justify-center select-none">
      <div
        className="flex-1 bg-bg-bright w-108 h-108 rounded-[7.27px] flex items-center justify-center flex-col text-blue-500 cursor-pointer"
        onClick={handleClick}
      >
        {value ? (
          <img src={value} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <>
            <Icon type="icon-xinjian" />
            <span className="text-[13px]/20">设置</span>
          </>
        )}
      </div>
      <div className="text-12/400 text-symbol-medium">组件封面</div>
    </div>
  );
}
