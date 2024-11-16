import { UploadOutlined } from '@ant-design/icons'
import { Menu } from 'antd'

import './index.less'

const items = [
  {
    label: '上传',
    key: 'Upload',
    icon: <UploadOutlined />,
    children: [
      {
        label: '上传文件',
        key: 'upload:file'
      },
      {
        label: '上传目录',
        key: 'upload:dir'
      }
    ]
  }
]

function handleDirectoryUpload(e) {
  const file = e.target.files
  console.log('files:', file, file.length)
}

function handleFileUpload(e) {
  const file = e.target.files
  console.log('files:', file, file.length)
}

export default function Uploader() {
  const onClick = (e) => {
    if (e.key === 'upload:dir') {
      const inputElement = document.createElement('input')
      inputElement.type = 'file'
      inputElement.webkitdirectory = true
      inputElement.directory = true
      inputElement.mozdirectory = true
      inputElement.msdirectory = true
      inputElement.odirectory = true
      inputElement.onchange = handleDirectoryUpload
      inputElement.click()
    }
    if (e.key === 'upload:file') {
      const inputElement = document.createElement('input')
      inputElement.type = 'file'
      inputElement.multiple = true
      inputElement.onchange = handleFileUpload
      inputElement.click()
    }
  }
  return (
    <Menu
      onClick={onClick}
      mode="horizontal"
      items={items}
      selectable={false}
      triggerSubMenuAction="click"
    />
  )
}
