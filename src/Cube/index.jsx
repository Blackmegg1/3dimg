import React, { useEffect, useRef, useState } from "react";
import { Button, Drawer, Form, Input } from "antd";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import regularFont from "three/examples/fonts/optimer_regular.typeface.json";

const Cube = () => {
  const [form] = Form.useForm();
  const containerRef = useRef();
  const [open, setOpen] = useState(false);
  const [axisStart, setAxisStart] = useState(0);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x808080);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // 创建光源
    const color = 0xffffff;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    containerRef.current.appendChild(renderer.domElement);
    // 镜头控制
    const controls = new OrbitControls(camera, renderer.domElement);

    // 创建坐标轴辅助对象
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);

    // 创建体材质
    const transparentMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    // 创建基础长方体
    const cubeGeometry = new THREE.BoxGeometry(100, 20, 20);
    const cubeMesh = new THREE.Mesh(cubeGeometry, transparentMaterial);
    cubeMesh.position.set(50, 10, 10);
    scene.add(cubeMesh);

    // 添加网格线
    addGridLines(cubeMesh, 10);
    // 添加平面体
    addCuttingPlane(80, 2);
    // 添加曲面体
    addCurve(50, 1);
    // 添加刻度文字
    addAxisNumber(axisStart, 100, 10);
    // 设置相机位置
    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 100;

    // 渲染场景
    const animate = () => {
      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      requestAnimationFrame(animate);
      controls.update(); // 在每一帧都更新控制器
      renderer.render(scene, camera);
    };

    // 为长方体添加网格线
    function addGridLines(mesh, spacing) {
      var geometry = new THREE.BufferGeometry();
      var material = new THREE.LineBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.3,
      });

      var vertices = [];

      // 添加 x 轴方向的网格线
      for (
        var i = -mesh.geometry.parameters.width / 2;
        i <= mesh.geometry.parameters.width / 2;
        i += spacing
      ) {
        for (
          var j = -mesh.geometry.parameters.height / 2;
          j <= mesh.geometry.parameters.height / 2;
          j += spacing
        ) {
          vertices.push(i, j, -mesh.geometry.parameters.depth / 2);
          vertices.push(i, j, mesh.geometry.parameters.depth / 2);
        }
        for (
          var k = -mesh.geometry.parameters.depth / 2;
          k <= mesh.geometry.parameters.depth / 2;
          k += spacing
        ) {
          vertices.push(i, -mesh.geometry.parameters.height / 2, k);
          vertices.push(i, mesh.geometry.parameters.height / 2, k);
        }
      }

      // 添加 y 轴方向的网格线
      for (
        var ii = -mesh.geometry.parameters.height / 2;
        ii <= mesh.geometry.parameters.height / 2;
        ii += spacing
      ) {
        for (
          var jj = -mesh.geometry.parameters.depth / 2;
          jj <= mesh.geometry.parameters.depth / 2;
          jj += spacing
        ) {
          vertices.push(-mesh.geometry.parameters.width / 2, ii, jj);
          vertices.push(mesh.geometry.parameters.width / 2, ii, jj);
        }
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );

      var lines = new THREE.LineSegments(geometry, material);
      mesh.add(lines);
    }

    // 绘制长方体
    function addCuttingPlane(x, depth = 1, color = 0xff0000) {
      var boxGeometry = new THREE.BoxGeometry(depth, 20, 20); // 设置长方体的大小
      var boxMaterial = new THREE.MeshBasicMaterial({
        color: color,
      });
      var box = new THREE.Mesh(boxGeometry, boxMaterial);

      // 设置长方体的位置
      box.position.x = x;
      box.position.y = 10;
      box.position.z = 10;

      // 将长方体添加到场景
      scene.add(box);
    }

    // 绘制曲面
    function addCurve(x = 0, depth = 1, color = 0xff0000) {
      for (let i = 0; i < 20; i++) {
        // 创建曲线
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0 + x, 0, i * 1.0), // 使用 i 来调整 z 坐标值
          new THREE.Vector3(5 + x, 10, i * 1.0),
          new THREE.Vector3(0 + x, 20, i * 1.0),
        ]);

        // 定义管道半径
        const tubeRadius = depth / 2;

        // 定义管道的细分数
        const tubularSegments = 100;

        // 定义弯曲管道的细分数
        const radialSegments = 100;

        // 是否闭合管道
        const closed = false;

        // 创建 TubeGeometry
        const geometry = new THREE.TubeGeometry(
          curve,
          tubularSegments,
          tubeRadius,
          radialSegments,
          closed
        );

        // 创建材质
        const material = new THREE.MeshBasicMaterial({
          color: color,
        });

        // 创建曲面对象
        const mesh = new THREE.Mesh(geometry, material);

        // 将曲面对象添加到场景
        scene.add(mesh);
      }
    }

    // 绘制文字
    function addText(text, position, color) {
      const font = new FontLoader().parse(regularFont);
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 3,
        height: 0.1,
      });
      const textMaterial = new THREE.MeshBasicMaterial({ color });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.copy(position);
      textMesh.rotation.x = -Math.PI / 2;
      scene.add(textMesh);
    }

    // 生成X轴刻度
    function addAxisNumber(xstart = 0, xlong, divide) {
      const step = xlong / divide;
      for (let i = 0; i <= divide; i++) {
        const xPos = i * step;
        const text = (xstart + i * step).toString();

        addText(text, new THREE.Vector3(xPos - 2, 0, 25), 0x000000);
      }
      // 增加单位
      addText("(m)", new THREE.Vector3(xlong + 8, 0, 25), 0x000000);
    }

    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    animate();

    // 当组件卸载时，停止动画循环
    return () => {
      renderer.domElement.remove();
      renderer.forceContextLoss();
    };
  }, [axisStart]);

  const onFinish = (values) => {
    const { axisStart } = values;
    setAxisStart(+axisStart);
  };

  return (
    <>
      <Button
        type="primary"
        style={{ position: "fixed", top: "2vh", left: "1vw" }}
        onClick={showDrawer}
      >
        图像设置
      </Button>
      <div ref={containerRef} style={{ height: "100vh", width: "100vw" }}></div>
      <Drawer
        title="图像设置"
        placement="left"
        closable={true}
        onClose={onClose}
        open={open}
      >
        <Form onFinish={onFinish} initialValues={{ axisStart: axisStart }}>
          <Form.Item
            name="axisStart"
            label="坐标轴起始值"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default Cube;
