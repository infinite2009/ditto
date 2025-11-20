import { postVoltronCommonBfsUpload } from "@/api";

type TextEditorProps = any;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const RichEditorOptions: TextEditorProps['initOptions'] = {
  height: 400,
  plugins: ['link', 'image'],
  menubar: false,
  promotion: true,
  statusbar: true, // 拖拽大小
  elementpath: false,
  resize: false,
  toolbar: 'undo redo | bold italic underline link | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat  strikethrough | insertfile image media template link anchor codesample table code | ltr rtl',
  quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
  content_style: `
  html{
      height: 100%;
  }
  body{
      min-height: 100%;
  }
  .mce-content-body::before{
      font-size: 13px;
      color: #C9CCD0 !important;
  }
  .mce-content-body{
      font-size: 13px;
      cursor: text;
  }`,
  image_title: true,
  file_picker_types: 'image',
  automatic_uploads: true,
  images_upload_handler: (blobInfo) => new Promise((resolve, reject) => {
    const file = new File([blobInfo.blob()], blobInfo.filename());
    postVoltronCommonBfsUpload({file}).then(res => {
      resolve(res.data);
    });
  }),
  init_instance_callback: () => {
    // 由于取色器的面板，在 Modal 中被遮住，所以在初始化时，动态提升一下工具栏的 z-index
    const toxContainer = document.querySelectorAll<HTMLDivElement>('div.tox.tox-silver-sink.tox-tinymce-aux');

    toxContainer.forEach((ele) => {
      const { style } = ele;
      style.zIndex = '999999';
    });
  },
};