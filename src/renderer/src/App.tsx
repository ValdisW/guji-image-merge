import React, { useState, useRef, useEffect } from 'react';
import { Layout, Button, message, Row, Col, List, Checkbox, Tooltip, Menu } from 'antd';
import { UploadOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';

import "./App.css"

const { Header, Content, Sider } = Layout;



function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function App() {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageControls, setImageControls] = useState([
    { scale: 1, x: 0, y: 0 },
    { scale: 1, x: 0, y: 0 }
  ]);
  const canvasRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [displaySize, setDisplaySize] = useState({ width: 800, height: 600 });



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
      inputElement.multiple = true
      inputElement.onchange = handleFileUpload
      inputElement.click()
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = await Promise.all(files.map(async file => {
      const dataUrl = await blobToDataURL(file);
      return {
        uid: file.name,
        name: file.name,
        status: 'done',
        originFileObj: file,
        thumbnailUrl: dataUrl
      };
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
    message.success(`${files.length} 个文件添加成功`);
  };

  const handleDirectoryUpload = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = await Promise.all(files.map(async file => {
      const dataUrl = await blobToDataURL(file);
      return {
        uid: file.name,
        name: file.name,
        status: 'done',
        originFileObj: file,
        thumbnailUrl: dataUrl
      };
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
    message.success(`${files.length} 个文件添加成功`);
  };

  const handleImageSelection = (file) => {
    setSelectedImages(prev => {
      let newSelection;
      if (prev.includes(file)) {
        newSelection = prev.filter(f => f !== file);
      } else if (prev.length < 2) {
        newSelection = [...prev, file];
      } else {
        message.warning('您最多只能选择2张图片');
        newSelection = prev;
      }
      console.log('New selection:', newSelection);
      return newSelection;
    });
  };

  const saveImage = () => {
    if (selectedImages.length !== 2) {
      message.error('Please select exactly 2 images to combine');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      message.error('Canvas not found');
      return;
    }

    const link = document.createElement('a');
    link.download = 'combined_image.png';
    link.href = canvas.toDataURL('image/png');
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('Combined image saved successfully');
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = selectedImages.length - 1; i >= 0; i--) {
      const { x: imgX, y: imgY, scale } = imageControls[i];
      const img = new Image();
      img.src = selectedImages[i].thumbnailUrl;

      if (
        x >= imgX &&
        x <= imgX + img.width * scale &&
        y >= imgY &&
        y <= imgY + img.height * scale
      ) {
        setActiveImageIndex(i);
        setIsDragging(true);
        setLastPosition({ x, y });
        break;
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && activeImageIndex !== null) {
      console.log("dragging")
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - lastPosition.x;
      const dy = y - lastPosition.y;

      setImageControls(prev => {
        const newControls = [...prev];
        newControls[activeImageIndex] = {
          ...newControls[activeImageIndex],
          x: newControls[activeImageIndex].x + dx,
          y: newControls[activeImageIndex].y + dy,
        };
        return newControls;
      });

      setLastPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setActiveImageIndex(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = selectedImages.length - 1; i >= 0; i--) {
      const { x: imgX, y: imgY, scale } = imageControls[i];
      const img = new Image();
      img.src = selectedImages[i].thumbnailUrl;

      if (
        x >= imgX &&
        x <= imgX + img.width * scale &&
        y >= imgY &&
        y <= imgY + img.height * scale
      ) {
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setImageControls(prev => {
          const newControls = [...prev];
          newControls[i] = {
            ...newControls[i],
            scale: newControls[i].scale * scaleFactor,
          };
          return newControls;
        });
        break;
      }
    }
  };

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
    console.log('selectedImages changed:', selectedImages);
    if (selectedImages.length === 2) {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas not found');
        return;
      }

      const ctx = canvas.getContext('2d');
      let maxWidth = 0;
      let maxHeight = 0;

      const loadedImages = selectedImages.map(() => new Image());
      let loadedCount = 0;

      const drawImages = () => {
        console.log('Drawing images');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        loadedImages.forEach((img, index) => {
          const { scale, x, y } = imageControls[index];
          ctx.drawImage(
            img,
            x,
            y,
            img.width * scale,
            img.height * scale
          );
        });
      };

      loadedImages.forEach((img, index) => {
        img.onload = () => {
          console.log(`Image ${index} loaded`);
          maxWidth = Math.max(maxWidth, img.width);
          maxHeight = Math.max(maxHeight, img.height);
          loadedCount++;

          if (loadedCount === 2) {
            console.log('Both images loaded, setting canvas size');
            const totalWidth = loadedImages[0].width + loadedImages[1].width;
            const maxHeight = Math.max(loadedImages[0].height, loadedImages[1].height);
            
            setCanvasSize({ width: totalWidth, height: maxHeight });
            setDisplaySize({ 
              width: Math.min(totalWidth, 800), 
              height: Math.min(maxHeight, 600) 
            });
            canvas.width = totalWidth;
            canvas.height = maxHeight;
            
            // 重置图像控制
            setImageControls([
              { scale: 1, x: 0, y: 0 },
              { scale: 1, x: loadedImages[0].width, y: 0 }
            ]);
            
            drawImages();
          }
        };
        img.src = selectedImages[index].thumbnailUrl;
        console.log(`Setting src for image ${index}`);
      });
    }
  }, [selectedImages]);

  return (
    <Layout className="layout">
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
        <Sider width="25%" style={{ backgroundColor: '#fff', overflowY: 'scroll' }}>
        <p>Select 2 images to combine. Drag to move images, scroll to zoom</p>
            <List
              dataSource={images}
              renderItem={item => (
                <List.Item>
                  <Tooltip
                    title={<img src={item.thumbnailUrl} alt={item.name} style={{ maxWidth: '200px', maxHeight: '200px' }} />}
                    mouseEnterDelay={0.5}
                  >
                    <Checkbox
                      checked={selectedImages.includes(item)}
                      onChange={() => handleImageSelection(item)}
                    >
                      {item.name}
                    </Checkbox>
                  </Tooltip>
                </List.Item>
              )}
            />
        </Sider>
        <Content style={{ padding: '0 50px', height: '100%' }}>
          <canvas
            ref={canvasRef}
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
  );
}

export default App;