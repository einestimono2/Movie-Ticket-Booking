import { Empty, Button } from 'antd';

export default function NoDataCard(props) {
  return (
    <div className={props.className}>
      <Empty className="fs-4 fw-bold my-5 text-danger" description={props.text}>
        {props.onAction && (
          <Button type="primary" size="large" className="px-5" onClick={props.onAction}>
            {props.actionText ?? 'Thử lại'}
          </Button>
        )}
      </Empty>
    </div>
  );
}
