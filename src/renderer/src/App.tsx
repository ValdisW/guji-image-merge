import React, { useState, useRef, useEffect } from 'react'
import { Layout, message, List, Checkbox, Tooltip, Menu } from 'antd'
import { UploadOutlined, SaveOutlined } from '@ant-design/icons'

import './App.css'

const { Header, Content, Sider } = Layout

interface ImageItem {
  uid: string
  name: string
  status: string
  originFileObj: File
  thumbnailUrl: string
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (): void => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function uploadDirectory(cb): void {
  const inputElement = document.createElement('input')
  inputElement.type = 'file'
  inputElement.webkitdirectory = true
  inputElement.onchange = cb
  inputElement.click()
}

function uploadImageFiles(cb): void {
  const inputElement = document.createElement('input')
  inputElement.type = 'file'
  inputElement.accept = 'image/*'
  inputElement.multiple = true
  inputElement.onchange = cb
  inputElement.click()
}

function App(): JSX.Element {
  const [images, setImages] = useState<ImageItem[]>([]) // 用户上传的图像文件
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([]) // 被选中的用来处理的图像
  const [imageControls, setImageControls] = useState([
    { scale: 1, x: 0, y: 0 },
    { scale: 1, x: 0, y: 0 }
  ])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 600 })

  const onUpload = ({ key }): void => {
    if (key === 'upload:dir') uploadDirectory(handleDirectoryUpload)
    if (key === 'upload:file') uploadImageFiles(handleFileUpload)
  }

  // 上传文件
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newImages = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await blobToDataURL(file)
        return {
          uid: file.name,
          name: file.name,
          status: 'done',
          originFileObj: file,
          thumbnailUrl: dataUrl
        }
      })
    )
    setImages((prevImages) => [...prevImages, ...newImages])
    message.success(`${files.length} 个文件添加成功`)
  }

  // 上传目录
  const handleDirectoryUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const newImages = await Promise.all(
      files.map(async (file) => {
        const dataUrl = await blobToDataURL(file)
        return {
          uid: file.name,
          name: file.name,
          status: 'done',
          originFileObj: file,
          thumbnailUrl: dataUrl
        }
      })
    )
    setImages((prevImages) => [...prevImages, ...newImages])
    message.success(`${files.length} 个文件添加成功`)
  }

  // 左侧图片列表点选图片
  const handleImageSelection = (file: ImageItem): void => {
    // 更新已选择的图片
    setSelectedImages((prev) => {
      let newSelection
      if (prev.includes(file)) {
        // 取消选择
        newSelection = prev.filter((f) => f !== file)
      } else if (prev.length < 2) {
        // 增加选择
        newSelection = [...prev, file]
      } else {
        // 超出可选最大值
        message.warning('您最多只能选择2张图片')
        newSelection = prev
      }
      return newSelection
    })
  }

  const saveImage = (): void => {
    if (selectedImages.length !== 2) {
      message.error('Please select exactly 2 images to combine')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      message.error('Canvas not found')
      return
    }

    const link = document.createElement('a')
    link.download = 'combined_image.png'
    link.href = canvas.toDataURL('image/png')

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    message.success('Combined image saved successfully')
  }

  const handleMouseDown = (e): void => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (let i = selectedImages.length - 1; i >= 0; i--) {
      const { x: imgX, y: imgY, scale } = imageControls[i]
      const img = new Image()
      img.src = selectedImages[i].thumbnailUrl

      if (
        x >= imgX &&
        x <= imgX + img.width * scale &&
        y >= imgY &&
        y <= imgY + img.height * scale
      ) {
        setActiveImageIndex(i)
        setIsDragging(true)
        setLastPosition({ x, y })
        break
      }
    }
  }

  const handleMouseMove = (e): void => {
    if (isDragging && activeImageIndex !== null) {
      console.log('dragging')
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const dx = x - lastPosition.x
      const dy = y - lastPosition.y

      setImageControls((prev) => {
        const newControls = [...prev]
        newControls[activeImageIndex] = {
          ...newControls[activeImageIndex],
          x: newControls[activeImageIndex].x + dx,
          y: newControls[activeImageIndex].y + dy
        }
        return newControls
      })

      setLastPosition({ x, y })
    }
  }

  const handleMouseUp = (): void => {
    setIsDragging(false)
    setActiveImageIndex(null)
  }

  const handleWheel = (e): void => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (let i = selectedImages.length - 1; i >= 0; i--) {
      const { x: imgX, y: imgY, scale } = imageControls[i]
      const img = new Image()
      img.src = selectedImages[i].thumbnailUrl

      if (
        x >= imgX &&
        x <= imgX + img.width * scale &&
        y >= imgY &&
        y <= imgY + img.height * scale
      ) {
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1
        setImageControls((prev) => {
          const newControls = [...prev]
          newControls[i] = {
            ...newControls[i],
            scale: newControls[i].scale * scaleFactor
          }
          return newControls
        })
        break
      }
    }
  }

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
    },
    {
      label: '保存',
      key: 'save',
      icon: <SaveOutlined />,
      onClick: saveImage,
      disabled: selectedImages.length !== 2
    }
  ]

  useEffect(() => {
    if (selectedImages.length === 2) {
      const canvas = canvasRef.current
      if (!canvas) {
        console.error('画布错误：画布丢失')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('画布错误：无法获取2d context')
        return
      }

      let maxWidth = 0
      let maxHeight = 0

      // 转换为Image对象
      const loadedImages = selectedImages.map((e) => {
        const img = new Image()
        img.src = e.thumbnailUrl
        return img
      })

      const drawImages = (): void => {
        console.log('Drawing images')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        loadedImages.forEach((img, index) => {
          const { scale, x, y } = imageControls[index]
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale)
        })
      }

      let loadedCount = 0

      loadedImages.forEach((img, index) => {
        img.onload = (): void => {
          console.log(`Image ${index} loaded`)
          maxWidth = Math.max(maxWidth, img.width)
          maxHeight = Math.max(maxHeight, img.height)
          loadedCount++

          if (loadedCount === 2) {
            console.log('Both images loaded, setting canvas size')
            const totalWidth = loadedImages[0].width + loadedImages[1].width
            const maxHeight = Math.max(loadedImages[0].height, loadedImages[1].height)

            // setCanvasSize({ width: totalWidth, height: maxHeight })
            setDisplaySize({
              width: Math.min(totalWidth, 800),
              height: Math.min(maxHeight, 600)
            })
            console.log('重设画布尺寸')
            canvas.width = totalWidth
            canvas.height = maxHeight

            // 重置图像控制
            setImageControls([
              { scale: 1, x: 0, y: 0 },
              { scale: 1, x: loadedImages[0].width, y: 0 }
            ])

            drawImages()
          }
        }
        img.src = selectedImages[index].thumbnailUrl
        console.log(`Setting src for image ${index}`)
      })
    }
  }, [selectedImages])

  return (
    <Layout className="layout">
      <Header>
        <Menu
          onClick={onUpload}
          mode="horizontal"
          items={menuItems}
          selectable={false}
          triggerSubMenuAction="click"
        />
      </Header>
      <Layout>
        <Sider width="25%" style={{ backgroundColor: '#fff', overflowY: 'scroll' }}>
          <p>Select 2 images to combine. Drag to move images, scroll to zoom</p>
          <List
            dataSource={images}
            renderItem={(item) => (
              <Tooltip
                placement="right"
                title={
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                }
                mouseEnterDelay={0.3}
              >
                <List.Item>
                  <Checkbox
                    checked={selectedImages.includes(item)}
                    onChange={() => handleImageSelection(item)}
                  >
                    {item.name}
                  </Checkbox>
                </List.Item>
              </Tooltip>
            )}
          />
        </Sider>
        <Content style={{ padding: '0 50px', height: '100%' }}>
          <canvas
            ref={canvasRef}
            // width={800}
            // height={600}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              border: '1px solid #d9d9d9',
              width: `${displaySize.width}px`,
              height: `${displaySize.height}px`
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
