import { List } from 'antd'

function FileList({ files }: { files: FileList }) {
  return (
    <List
      size="small"
      dataSource={files}
      renderItem={(item) => <List.Item>{item.name}</List.Item>}
    />
  )
}

export default FileList
