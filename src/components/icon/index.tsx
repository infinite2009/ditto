import { createFromIconfontCN } from '@ant-design/icons';
import { IconFontProps } from '@ant-design/icons/lib/components/IconFont';

export type IconProps = Omit<IconFontProps, 'type'>;

export const Icon = createFromIconfontCN({
  // 必需要使用 https 协议，否则会使用 tauri 协议
  scriptUrl: 'https://at.alicdn.com/t/c/font_4341626_95lp4u5crg.js'
});

export function Draggable(props: IconProps) {
  return <Icon {...props} type="icon-a-more_horizontal_fillgengduoheng" />;
}

export function Ok(props: IconProps) {
  return <Icon {...props} type="icon-gou-queren" />;
}

export function Playlist2(props: IconProps) {
  return <Icon {...props} type="icon-bodan2" />;
}

export function Menu2(props: IconProps) {
  return <Icon {...props} type="icon-caidan2" />;
}

export function Plus(props: IconProps) {
  return <Icon {...props} type="icon-xinjian" />;
}

export function Menu(props: IconProps) {
  return <Icon {...props} type="icon-caidan" />;
}

export function Undo(props: IconProps) {
  return <Icon {...props} type="icon-chexiao-xianghou" />;
}

export function CloseThin(props: IconProps) {
  return <Icon {...props} type="icon-guanbi-1" />;
}

export function Close(props: IconProps) {
  return <Icon {...props} type="icon-guanbi" />;
}

export function Clear(props: IconProps) {
  return <Icon {...props} type="icon-shanchusousuo" />;
}

export function Arrow(props: IconProps) {
  return <Icon {...props} type="icon-jiantou-xiangyou" />;
}

export function ArrowDown(props: IconProps) {
  return <Icon {...props} type="icon-jiantou" />;
}

export function Eye(props: IconProps) {
  return <Icon {...props} type="icon-liulan" />;
}

export function DescendantOrder(props: IconProps) {
  return <Icon {...props} type="icon-paixu-zheng" />;
}

export function Layout(props: IconProps) {
  return <Icon {...props} type="icon-buju" />;
}

export function More(props: IconProps) {
  return <Icon {...props} type="icon-gengduo" />;
}

export function AscendingOrder(props: IconProps) {
  return <Icon {...props} type="icon-paixu-dao" />;
}

export function Expand(props: IconProps) {
  return <Icon {...props} type="icon-cezhankai" />;
}

export function Phone(props: IconProps) {
  return <Icon {...props} type="icon-shouji" />;
}

export function Tablet(props: IconProps) {
  return <Icon {...props} type="icon-pingban" />;
}

export function Download(props: IconProps) {
  return <Icon {...props} type="icon-xiazai" />;
}

export function ExpandScreen(props: IconProps) {
  return <Icon {...props} type="icon-chuangkoukuanpingzhankai" />;
}

export function Note(props: IconProps) {
  return <Icon {...props} type="icon-liulan" />;
}

export function Desktop(props: IconProps) {
  return <Icon {...props} type="icon-web" />;
}

export function Preview(props: IconProps) {
  return <Icon {...props} type="icon-bofang" />;
}

export function ExpandDown(props: IconProps) {
  return <Icon {...props} type="icon-zhankai-1" />;
}

export function PhoneSmall(props: IconProps) {
  return <Icon {...props} type="icon-shouji-xiao" />;
}

export function Redo(props: IconProps) {
  return <Icon {...props} type="icon-chexiao-xiangqian" />;
}

export function Clean(props: IconProps) {
  return <Icon {...props} type="icon-qingchu" />;
}

export function NewFolder(props: IconProps) {
  return <Icon {...props} type="icon-wenjianjiachuangjian" />;
}

export function WebSmall(props: IconProps) {
  return <Icon {...props} type="icon-web-xiao" />;
}

export function NewPage(props: IconProps) {
  return <Icon {...props} type="icon-shoujizhuomiankuaijie" />;
}

export function Share(props: IconProps) {
  return <Icon {...props} type="icon-fenxiang" />;
}

export function EyeClose(props: IconProps) {
  return <Icon {...props} type="icon-a-eye_browse_off_linebukejian" />;
}

export function PlayList(props: IconProps) {
  return <Icon {...props} type="icon-bodan" />;
}

export function SuccessFilled(props: IconProps) {
  return <Icon {...props} type="icon-fankuitijiaochenggong" />;
}

export function SwitchOrder(props: IconProps) {
  return <Icon {...props} type="icon-qiehuan" />;
}

export function Feedback(props: IconProps) {
  return <Icon {...props} type="icon-wentifankui" />;
}

export function Home(props: IconProps) {
  return <Icon {...props} type="icon-zhuye" />;
}

export function ArrowSmall(props: IconProps) {
  return <Icon {...props} type="icon-dakai" />;
}

export function InfoFilled(props: IconProps) {
  return <Icon {...props} type="icon-xinxi" />;
}

export function Start(props: IconProps) {
  return <Icon {...props} type="icon-hengxiangshunpaibu" />;
}

export function SpaceAround(props: IconProps) {
  return <Icon {...props} type="icon-hengxiangjunfenpaibu" />;
}

export function Height(props: IconProps) {
  return <Icon {...props} type="icon-gaodu" />;
}

export function Width(props: IconProps) {
  return <Icon {...props} type="icon-kuandu" />;
}

export function ShortBar(props: IconProps) {
  return <Icon {...props} type="icon-bujuweizhi-hengxiang-duan" />;
}

export function TextAlignJustify(props: IconProps) {
  return <Icon {...props} type="icon-zuoyoulaqi" />;
}

export function Border(props: IconProps) {
  return <Icon {...props} type="icon-bianju" />;
}

export function AlignStart(props: IconProps) {
  return <Icon {...props} type="icon-bujuweizhi-hengxiang-shang" />;
}

export function Bold(props: IconProps) {
  return <Icon {...props} type="icon-jiacu" />;
}

export function ExpandThin(props: IconProps) {
  return <Icon {...props} type="icon-zhankai" />;
}

export function AlignCenter(props: IconProps) {
  return <Icon {...props} type="icon-bujuweizhi-hengxiang-zhong" />;
}

export function CircleCorner(props: IconProps) {
  return <Icon {...props} type="icon-yuanjiao" />;
}

export function Gap(props: IconProps) {
  return <Icon {...props} type="icon-jianju" />;
}

export function UnderLine(props: IconProps) {
  return <Icon {...props} type="icon-xiahuaxian" />;
}

export function SingleGap(props: IconProps) {
  return <Icon {...props} type="icon-danbianju" />;
}

export function TextAlignCenter(props: IconProps) {
  return <Icon {...props} type="icon-juzhongduiqi" />;
}

export function Minus(props: IconProps) {
  return <Icon {...props} type="icon-shanchu" />;
}

export function TextAlignRight(props: IconProps) {
  return <Icon {...props} type="icon-youduiqi" />;
}

export function PlusThin(props: IconProps) {
  return <Icon {...props} type="icon-tianjia" />;
}

export function Padding(props: IconProps) {
  return <Icon {...props} type="icon-shuangbianju" />;
}

export function Thickness(props: IconProps) {
  return <Icon {...props} type="icon-xiankuang-cuxi" />;
}

export function Compact(props: IconProps) {
  return <Icon {...props} type="icon-kuandu-jincouneirong" />;
}

export function SingleBorderRadius(props: IconProps) {
  return <Icon {...props} type="icon-danduyuanjiao" />;
}

export function BorderRadius(props: IconProps) {
  return <Icon {...props} type="icon-yuanjiao" />;
}

export function SingleBorder(props: IconProps) {
  return <Icon {...props} type="icon-danxiankuang" />;
}

export function Line(props: IconProps) {
  return <Icon {...props} type="icon-xiankuang-zhixian" />;
}

export function Fixed(props: IconProps) {
  return <Icon {...props} type="icon-guding" />;
}

export function LongBar(props: IconProps) {
  return <Icon {...props} type="icon-bujuweizhi-hengxiang-chang" />;
}

export function AlignCenter2(props: IconProps) {
  return <Icon {...props} type="icon-bujuweizhi-zongxiang-zhong" />;
}

export function Shadow(props: IconProps) {
  return <Icon {...props} type="icon-touying" />;
}

export function ColumnSpaceBetween(props: IconProps) {
  return <Icon {...props} type="icon-zongxiangliangduanduiqipaibu" />;
}

export function TextAlignLeft(props: IconProps) {
  return <Icon {...props} type="icon-zuoduiqi" />;
}

export function RowSpaceBetween(props: IconProps) {
  return <Icon {...props} type="icon-hengxiangliangduanduiqipaibu" />;
}

export function ColumnSpaceAround(props: IconProps) {
  return <Icon {...props} type="icon-zongxiangjunfenpaibu" />;
}

export function LineThrough(props: IconProps) {
  return <Icon {...props} type="icon-zhonghuaxian" />;
}

export function ColumnLayout(props: IconProps) {
  return <Icon {...props} type="icon-zongxiangshunpaibu" />;
}

export function Border2(props: IconProps) {
  return <Icon {...props} type="icon-xiankuang-sizhou" />;
}

export function Wrap(props: IconProps) {
  return <Icon {...props} type="icon-jiantou-huanhang" />;
}

export function NoWrap(props: IconProps) {
  return <Icon {...props} type="icon-jiantou-jinhuanhang" />;
}

export function Grow(props: IconProps) {
  return <Icon {...props} type="icon-shiyingkuochong" />;
}

export function Italic(props: IconProps) {
  return <Icon {...props} type="icon-xieti" />;
}

export function DashedLine(props: IconProps) {
  return <Icon {...props} type="icon-xiankuang-xuxian" />;
}

export function DatePickerIcon(props: IconProps) {
  return <Icon {...props} type="icon-rili" />;
}

export function PaginationIcon(props: IconProps) {
  return <Icon {...props} type="icon-fenye" />;
}

export function ListIcon(props: IconProps) {
  return <Icon {...props} type="icon-liebiao" />;
}

export function AnchorIcon(props: IconProps) {
  return <Icon {...props} type="icon-maodian" />;
}

export function EmptyIcon(props: IconProps) {
  return <Icon {...props} type="icon-kongtai" />;
}

export function CheckboxIcon(props: IconProps) {
  return <Icon {...props} type="icon-gouxuankuang" />;
}

export function TableIcon(props: IconProps) {
  return <Icon {...props} type="icon-biaoge" />;
}

export function SwitchIcon(props: IconProps) {
  return <Icon {...props} type="icon-kaiguan" />;
}

export function MenuNavigateIcon(props: IconProps) {
  return <Icon {...props} type="icon-caidandaohang" />;
}

export function DrawerIcon(props: IconProps) {
  return <Icon {...props} type="icon-chouti" />;
}

export function SliderIcon(props: IconProps) {
  return <Icon {...props} type="icon-huatiao" />;
}

export function TabsIcon(props: IconProps) {
  return <Icon {...props} type="icon-tab" />;
}

export function CollapseIcon(props: IconProps) {
  return <Icon {...props} type="icon-zhedieliebiao" />;
}

export function CarouselIcon(props: IconProps) {
  return <Icon {...props} type="icon-zoumadeng" />;
}

export function SelectIcon(props: IconProps) {
  return <Icon {...props} type="icon-xuanzekuang" />;
}

export function ImageIcon(props: IconProps) {
  return <Icon {...props} type="icon-tupian" />;
}

export function TextIcon(props: IconProps) {
  return <Icon {...props} type="icon-wenzi" />;
}

export function AvatarIcon(props: IconProps) {
  return <Icon {...props} type="icon-touxiang" />;
}

export function TreeSelectIcon(props: IconProps) {
  return <Icon {...props} type="icon-shuxuanze" />;
}

export function ModalIcon(props: IconProps) {
  return <Icon {...props} type="icon-modal" />;
}

export function TagIcon(props: IconProps) {
  return <Icon {...props} type="icon-biaoqian" />;
}

export function RateIcon(props: IconProps) {
  return <Icon {...props} type="icon-pingfen" />;
}

export function SearchInputIcon(props: IconProps) {
  return <Icon {...props} type="icon-sousuokuang" />;
}

export function SearchIcon(props: IconProps) {
  return <Icon {...props} type="icon-sousuo" />;
}

export function StepsIcon(props: IconProps) {
  return <Icon {...props} type="icon-buzhoutiao" />;
}

export function InputIcon(props: IconProps) {
  return <Icon {...props} type="icon-shurukuang" />;
}

export function PopoverIcon(props: IconProps) {
  return <Icon {...props} type="icon-qipaokapian" />;
}

export function UploadIcon(props: IconProps) {
  return <Icon {...props} type="icon-shangchuan" />;
}

export function TransferIcon(props: IconProps) {
  return <Icon {...props} type="icon-chuansuokuang" />;
}

export function BreadCrumbIcon(props: IconProps) {
  return <Icon {...props} type="icon-mianbaoxie" />;
}

export function ButtonIcon(props: IconProps) {
  return <Icon {...props} type="icon-anniu" />;
}

export function HorizontalFlexIcon(props: IconProps) {
  return <Icon {...props} type="icon-shuipingrongqi" />;
}

export function VerticalFlexIcon(props: IconProps) {
  return <Icon {...props} type="icon-chuizhirongqi" />;
}

export function ComponentDefaultIcon(props: IconProps) {
  return <Icon {...props} type="icon-morenzujian" />;
}

export function FormIcon(props: IconProps) {
  return <Icon {...props} type="icon-biaodan" />;
}

export function Comment(props: IconProps) {
  return <Icon {...props} type="icon-comment" />;
}

export function CommentFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-bubble_comment_fillpinglun" />;
}

export function Trash(props: IconProps) {
  return <Icon {...props} type="icon-trash" />;
}

export function ResolveCheck(props: IconProps) {
  return <Icon {...props} type="icon-checkmark" />;
}

export function EditPencil(props: IconProps) {
  return <Icon {...props} type="icon-a-pen_write_square_linebianxie" />;
}

export function ResolvedFill(props: IconProps) {
  return <Icon {...props} type="icon-a-checkmark_circle_fillduigou" />;
}

export function OpenedBox(props: IconProps) {
  return <Icon {...props} type="icon-yemianzhuangtaitu-xiao" />;
}

export function Copy(props: IconProps) {
  return <Icon {...props} type="icon-a-copy_linefuzhi" />;
}

export function Order(props: IconProps) {
  return <Icon {...props} type="icon-arrow_sort_vertical_line" />;
}

export function Emoji(props: IconProps) {
  return <Icon {...props} type="icon-a-emoji_circle_linebiaoqing" />;
}

export function Annotation(props: IconProps) {
  return <Icon {...props} type="icon-a-tag_linebiaoqian" />;
}

export function TemplateFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-partition_square_fillfenqu" />;
}

export function Notation(props: IconProps) {
  return <Icon {...props} type="icon-a-bell_reserve_lineyuyue" />;
}

export function Link(props: IconProps) {
  return <Icon {...props} type="icon-a-chain_link_linelianjie" />;
}

export function Image(props: IconProps) {
  return <Icon {...props} type="icon-a-image_linetupian" />;
}

export function Info(props: IconProps) {
  return <Icon {...props} type="icon-xinxi1" />;
}

export function FavoriteLine(props: IconProps) {
  return <Icon {...props} type="icon-a-star_favorite_lineshoucang" />;
}

export function TemplateLine(props: IconProps) {
  return <Icon {...props} type="icon-a-partition_square_linefenqu" />;
}

export function WarningFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-warning_report_circle_filljingshi1" />;
}

export function DislikeFilled(props: IconProps) {
  return <Icon {...props} type="icon-dislike_fill" />;
}

export function ImageFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-image_filltupian" />;
}

export function EmojiCircleFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-emoji_circle_fillbiaoqing" />;
}

export function FavoriteFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-star_favorite_fillshoucang" />;
}

export function PlayListFilled(props: IconProps) {
  return <Icon {...props} type="icon-a-video_archive_fillbodan" />;
}

export function PlayListFilled2(props: IconProps) {
  return <Icon {...props} type="icon-a-video_archive_fillbodan2" />;
}

export function PlayListFilled1(props: IconProps) {
  return <Icon {...props} type="icon-a-video_archive_fillbodan1"/>;
}
