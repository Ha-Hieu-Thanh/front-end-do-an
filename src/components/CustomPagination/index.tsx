import icons from '@/assets/icons';
import { PAGE_SIZE, TextALign } from '@/connstant/enum/common';
import { Pagination, PaginationProps } from 'antd';
import classNames from 'classnames';
import styles from './styles.module.scss';

interface IProps extends PaginationProps {
  pageSize?: number;
  align?: TextALign;
  totalItems?: number;
  handleChangePage?: (page: number, pageSize: number) => void;
}
const CustomPagination = (props: IProps) => {
  const { pageSize = PAGE_SIZE, align = TextALign.Right, totalItems, handleChangePage, className, ...rest } = props;

  return (
    <Pagination
      total={totalItems}
      pageSize={pageSize}
      showSizeChanger={false}
      className={classNames(
        `${styles.pagination}`,
        className,
        { [styles.textLeft]: align === TextALign.Left },
        { [styles.textCenter]: align === TextALign.Center },
        { [styles.textRight]: align === TextALign.Right },
      )}
      itemRender={(page, type, element) => {
        if (type === 'prev') {
          return <img src={icons.PrevPinkOutlined} alt="prev-icon"></img>;
        }
        if (type === 'next') {
          return <img src={icons.NextPinkOutlined} alt="next-icon"></img>;
        }
        return element;
      }}
      onChange={(page, pageSize) => {
        console.log({ page, pageSize });
        handleChangePage!(page, pageSize);
      }}
      {...rest}
    />
  );
};
export default CustomPagination;
