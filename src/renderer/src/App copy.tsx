import { Layout, Menu } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import FileList from './components/FileList'

const { Header, Sider, Content, Footer } = Layout

const menuItems = [
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

function App(): JSX.Element {
  const [data, setData] = useState([])

  function handleDirectoryUpload(e) {
    const file = e.target.files
    setData(file)
    console.log('files:', file)
  }

  function handleFileUpload(e) {
    const file = e.target.files
    setData(file)
    console.log('files:', file)
  }

  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const onClick = (e) => {
    if (e.key === 'upload:dir') {
      const inputElement = document.createElement('input')
      inputElement.type = 'file'
      inputElement.webkitdirectory = true
      // inputElement.directory = true
      // inputElement.mozdirectory = true
      // inputElement.msdirectory = true
      // inputElement.odirectory = true
      inputElement.onchange = handleDirectoryUpload
      inputElement.click()
    }
    if (e.key === 'upload:file') {
      const inputElement = document.createElement('input')
      inputElement.type = 'file'
      inputElement.accept = 'image/*'
      inputElement.multiple = true
      inputElement.onchange = handleFileUpload
      inputElement.click()
    }
  }

  return (
    <>
      <Layout>
        <Header>
          <Menu
            onClick={onClick}
            mode="horizontal"
            items={menuItems}
            selectable={false}
            triggerSubMenuAction="click"
          />
        </Header>
        <Layout>
          <Sider width="25%" style={{ backgroundColor: '#fff' }}>
            <FileList files={data} />
          </Sider>
          <Content>
            <canvas></canvas>
          </Content>
        </Layout>
      </Layout>

      <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
        Send IPC
      </a>
    </>
  )
}

export default App
