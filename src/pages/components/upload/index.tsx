import { useEffect, useState } from 'react';
import { GetProp, Image, Upload, UploadFile, UploadProps } from 'antd';
import NewFileManager from '@/service/new-file-manager';
import { Plus } from '@/components/icon';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

export interface IUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  max?: number;
}

export default function UploadInput({ value, onChange, max = 1 }: IUploadProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState<any>([]);

  useEffect(() => {
    if (value) {
      setFileList([
        {
          url: value,
          status: 'done'
        }
      ]);
    }
  }, [value]);

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  async function handleChange({ fileList: newFileList }) {
    if (newFileList.length > 0) {
      const [file] = newFileList;
      if (file?.response?.url && file?.status === 'done') {
        onChange(file?.response?.url);
      }
    } else {
      onChange(undefined);
    }
    return setFileList(newFileList);
  }

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <Plus />
      <div style={{ marginTop: 8 }}>上传</div>
    </button>
  );

  async function doUpload(reqConfig: Record<string, any>) {
    // const uint8Array = await fileToUint8Array(reqConfig.file);
    const { onSuccess, onError } = reqConfig;
    try {
      const url = await NewFileManager.uploadImageToBfs(reqConfig.file);
      if (url) {
        // 存储服务返回的链接不是安全链接，但是该域名有证书，所以改为 https 协议
        // onSuccess({ url: url.replace('http://', 'https://') });
        onSuccess({ url });
      } else {
        onError();
      }
    } catch (e) {
      onError(e);
    }
  }

  return (
    <>
      <Upload
        customRequest={doUpload}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {fileList.length >= max ? null : uploadButton}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => !visible && setPreviewImage('')
          }}
          src={previewImage}
        />
      )}
    </>
  );
}
