// Chair De Ology - Three.js Application Core
(function () {
  'use strict';

  // --- Configuration & Constants ---
  const numOptions = 21;
  const maxSelections = 7;
  const minSelections = 5;
  const loadingDuration = 3000; // 3 seconds

  // Personality Factor system
  const optionImaginativeValues = [
    0, 0, 2,  // Options 0-2
    0, 1, 1,  // Options 3-5
    0, 0, 0,  // Options 6-8
    0, 1, 1,  // Options 9-11
    0, 1, 2,  // Options 12-14
    1, 2, 2,  // Options 15-17
    1, 2, 2   // Options 18-20
  ];
  const optionMoralValues = [
    "yes", "yes", "no",
    "yes", "no", "no",
    "no", "yes", "yes",
    "no", "no", "no",
    "yes", "yes", "yes",
    "no", "no", "yes",
    "yes", "no", "no"
  ];

  // 3D Model Offsets & Scales
  const modelOffsets = [
    { x: -10, y: 0, z: 0 },
    { x: -20, y: 5, z: 0 },
    { x: -5, y: 10, z: 10 },
    { x: 0, y: 85, z: 0 },
    { x: 0, y: 80, z: 0 },
    { x: 5, y: 75, z: 0 },    // Option 6
    { x: 90, y: -105, z: 0 },    // Option 7
    { x: 75, y: -100, z: 0 },    // Option 8
    { x: 70, y: -90, z: 0 },    // Option 9
    { x: 15, y: -35, z: 0 },    // Option 10
    { x: -5, y: -40, z: 0 },    // Option 11
    { x: -30, y: -40, z: 50 },    // Option 12
    { x: 80, y: -195, z: 0 },    // Option 13
    { x: 90, y: -240, z: 0 },    // Option 14
    { x: 95, y: -240, z: 0 },    // Option 15
    { x: 20, y: -190, z: 20 },    // Option 16
    { x: -20, y: -265, z: 0 },    // Option 17
    { x: -20, y: -235, z: 0 },    // Option 18
    { x: -130, y: 65, z: 0 },    // Option 19
    { x: 110, y: 5, z: 0 },    // Option 20
    { x: 135, y: -85, z: 0 }     // Option 21
  ];
  const offsetStep = 5;

  const modelScales = [
    1, 1, 1, 1, 1.3, 1.6, 1, 1, 1, 1.2, 1.3, 1.1, 0.8, 1, 1, 2, 1.7, 0.5, 1, 0.5, 2.5
  ];

  // Option Groups (7 groups of 3 options)
  const optionGroups = [];
  for (let i = 0; i < 7; i++) {
    optionGroups.push([i * 3, i * 3 + 1, i * 3 + 2]);
  }

  // --- Global Application State ---
  let currentPage = "main"; // "main", "loading", "result"
  let frameCount = 0;
  let totalScrollAmount = 0;
  let currentSelections = 0;
  const selectedOptions = Array(21).fill(false);

  let centerX = 0, centerY = 0, radius = 400;
  let angleOffset = 0;
  let pointM = { x: radius, y: 0 };
  let enlargedOption = null;

  let modelRotation = 0;
  let orbitControlEnabled = false;
  let orbitX = 0, orbitY = -Math.PI / 6;
  let centerOrbitX = 0, centerOrbitY = -Math.PI / 6;
  let prevMouseX = 0, prevMouseY = 0;
  let isMouseOverModel = false;
  let isMouseOverCenter = false;

  let isCounterHovered = false;
  let isPanelOpen = false;
  let panelPosition = 0; // 0 = closed, 1 = fully open
  let panelTargetPosition = 0;
  let panelWidth = 400;
  let panelEasing = 0.05;
  let panelClickBlockTimer = 0;

  let resetButtonX, resetButtonY;
  const resetButtonWidth = 160, resetButtonHeight = 60;

  let presentButtonX, presentButtonY;
  const presentButtonWidth = 280, presentButtonHeight = 110;
  let isButtonActive = false;
  let loadingStartTime = 0;

  let sittingStyleResult = null;

  // Ripples & Dots
  const rippleHistory = [];
  const maxRipples = 10;
  const rippleFadeSpeed = 0.01;
  const gridSpacing = 60;
  const gridOffset = { x: 0, y: 0 };

  let dots = [];
  const dotRadius = 10;
  let boundaryRadius = 200;
  let hoveredDot = null;
  const dotPulseSpeed = 0.1;
  const dotMinScale = 0.8;
  const dotMaxScale = 1.7;

  // DOM Canvases & Contexts
  let webglCanvas, uiCanvas, ctx;
  let width = window.innerWidth, height = window.innerHeight;
  let mouseX = width / 2, mouseY = height / 2;

  // Assets
  const optionImages = [];
  const detailImages = [];
  const styleImages = [];
  let centerImage = null;
  let presentButtonImage = null;

  // Three.js Core Objects
  let scene, camera, renderer;
  let centerChairMeshGroup = null;
  const optionMeshes = []; // Three.js Groups for options 0..20
  let mainSceneGroup = null;
  let resultSceneGroup = null;

  // --- Option Class ---
  class Option {
    constructor(angle, img, id) {
      this.angle = angle;
      this.baseSize = 80;
      this.size = this.baseSize;
      this.id = id;
      this.opacity = 255;
      this.img = img;
      this.x = 0;
      this.y = 0;
      this.isActive = true;
      this.isSelected = false;
      this.groupIndex = Math.floor(id / 3);
    }

    update() {
      this.x = centerX + radius * Math.cos(this.angle + angleOffset);
      this.y = centerY + radius * Math.sin(this.angle + angleOffset);
      this.size = this.isAtPointM() ? this.baseSize * 2 : this.baseSize;

      if (this.x < 0) {
        this.opacity = 0;
      } else {
        const fadeRange = height * 0.3;
        const halfHeight = height / 2;
        if (this.y < -halfHeight + fadeRange) {
          this.opacity = map(this.y, -halfHeight, -halfHeight + fadeRange, 0, 255);
        } else if (this.y > halfHeight - fadeRange) {
          this.opacity = map(this.y, halfHeight, halfHeight - fadeRange, 0, 255);
        } else {
          this.opacity = 255;
        }
      }
    }

    display() {
      if (this.opacity <= 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      if (!this.isActive) {
        ctx.globalAlpha = 50 / 255;
        drawCenteredImage(this.img, 0, 0, this.size, this.size);
      } else if (this.isSelected) {
        // Main image
        ctx.globalAlpha = this.opacity / 255;
        drawCenteredImage(this.img, 0, 0, this.size, this.size);

        // Inner glow effect (ADD blend mode)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (70 / 255) * (this.opacity / 255);
        drawCenteredImage(this.img, 0, 0, this.size * 0.9, this.size * 0.9);
        ctx.restore();

        // Pulsing outline
        const pulseSpeed = 0.06;
        const pulseMinSize = 0.8;
        const pulseMaxSize = 1.0;
        const pulseSize = this.size * (pulseMinSize + (pulseMaxSize - pulseMinSize) * Math.sin(frameCount * pulseSpeed));

        ctx.beginPath();
        ctx.arc(0, 0, pulseSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(this.opacity / 255) * 0.8})`;
        ctx.stroke();
      } else {
        // Regular unselected item
        ctx.globalAlpha = this.opacity / 255;
        drawCenteredImage(this.img, 0, 0, this.size, this.size);
      }

      ctx.restore();
    }

    isAtPointM() {
      if (!this.isActive) return false;
      return dist(this.x, this.y, pointM.x, pointM.y) < 20;
    }
  }

  const options = [];

  // --- Helper Functions ---
  function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  function constrain(val, minVal, maxVal) {
    return Math.max(minVal, Math.min(maxVal, val));
  }

  function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function drawCenteredImage(img, x, y, w, h) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
  }

  // --- Asset Loading ---
  function loadAssets() {
    const timestamp = Date.now();

    // Load Option thumbnails & Details
    for (let i = 1; i <= numOptions; i++) {
      const img = new Image();
      img.src = `Thumbnails/opt${i}.png?t=${timestamp}`;
      optionImages.push(img);

      const dA = new Image(); dA.src = `Assets/Details/detailA_${i}.png?t=${timestamp}`;
      const dB = new Image(); dB.src = `Assets/Details/detailB_${i}.png?t=${timestamp}`;
      const dC = new Image(); dC.src = `Assets/Details/detailC_${i}.png?t=${timestamp}`;
      detailImages[i - 1] = [dA, dB, dC];
    }

    centerImage = new Image();
    centerImage.src = `Assets/White ring.png?t=${timestamp}`;

    presentButtonImage = new Image();
    presentButtonImage.src = `Assets/Present.png?t=${timestamp}`;

    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.src = `Assets/Style/Style_${i}.png?t=${timestamp}`;
      styleImages.push(img);
    }
  }

  // --- Three.js Setup & Model Parsing ---
  function initThreeJS() {
    webglCanvas = document.getElementById('webgl-canvas');

    scene = new THREE.Scene();

    camera = new THREE.OrthographicCamera(
      -width / 2, width / 2,
      height / 2, -height / 2,
      0.1, 2000
    );
    camera.position.set(0, 0, 1000);
    camera.lookAt(0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer = new THREE.WebGLRenderer({
      canvas: webglCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    // Scene Groups
    mainSceneGroup = new THREE.Group();
    resultSceneGroup = new THREE.Group();

    scene.add(mainSceneGroup);
    scene.add(resultSceneGroup);

    // Lights for Main Scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    mainSceneGroup.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(200, 300, 500);
    mainSceneGroup.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    dirLight2.position.set(-200, -100, 300);
    mainSceneGroup.add(dirLight2);

    // Lights for Result Scene
    const resAmbient = new THREE.AmbientLight(0xffffff, 0.7);
    resultSceneGroup.add(resAmbient);

    const resDir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    resDir1.position.set(200, 300, 500);
    resultSceneGroup.add(resDir1);

    const resDir2 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    resDir2.position.set(-200, -100, 300);
    resultSceneGroup.add(resDir2);

    // Parse OBJ Data from window.MODEL_DATA
    const objLoader = new THREE.OBJLoader();

    // Helper to process OBJ models using native Blender world coordinates
    function parseAndNormalizeOBJ(objText, material) {
      const group = objLoader.parse(objText);
      group.traverse((child) => {
        if (child.isMesh) {
          if (material) {
            child.material = material;
          }
        }
      });
      return group;
    }

    function buildWireframeChair(defaultChairRaw) {
      centerChairMeshGroup = new THREE.Group();

      const solidMat = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        specular: 0x444444,
        shininess: 20,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });

      defaultChairRaw.traverse((child) => {
        if (child.isMesh) {
          const geom = child.geometry;

          // Translucent mesh
          const solidMesh = new THREE.Mesh(geom, solidMat);
          centerChairMeshGroup.add(solidMesh);

          // Wireframe outline
          const wireframeGeom = new THREE.WireframeGeometry(geom);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            linewidth: 1
          });
          const lineSegments = new THREE.LineSegments(wireframeGeom, lineMat);
          centerChairMeshGroup.add(lineSegments);
        }
      });
      mainSceneGroup.add(centerChairMeshGroup);
    }

    // Default Chair Wireframe
    if (window.MODEL_DATA && window.MODEL_DATA['Default_Chair']) {
      const defaultChairRaw = objLoader.parse(window.MODEL_DATA['Default_Chair']);
      buildWireframeChair(defaultChairRaw);
    } else {
      objLoader.load('Assets/Background/Default_Chair.obj', (defaultChairRaw) => {
        buildWireframeChair(defaultChairRaw);
      });
    }

    // Option Models (1..21)
    const optionMaterial = new THREE.MeshPhongMaterial({
      color: 0xf5f5f5,
      specular: 0x282828,
      shininess: 30,
      side: THREE.DoubleSide
    });

    for (let i = 1; i <= numOptions; i++) {
      const key = `Option${i}_P`;
      if (window.MODEL_DATA && window.MODEL_DATA[key]) {
        const optionGroup = parseAndNormalizeOBJ(window.MODEL_DATA[key], optionMaterial.clone());
        optionMeshes.push(optionGroup);
        mainSceneGroup.add(optionGroup);
        optionGroup.visible = false;
      } else {
        const placeholderGroup = new THREE.Group();
        optionMeshes.push(placeholderGroup);
        mainSceneGroup.add(placeholderGroup);
        placeholderGroup.visible = false;

        objLoader.load(`Assets/OBJ/Option${i}_P.obj`, (loadedGroup) => {
          loadedGroup.traverse((child) => {
            if (child.isMesh) {
              child.material = optionMaterial.clone();
            }
          });
          placeholderGroup.add(loadedGroup);
        });
      }
    }
  }

  // --- Setup Application ---
  function setup() {
    uiCanvas = document.getElementById('ui-canvas');
    ctx = uiCanvas.getContext('2d');

    resize();

    centerX = 0;
    centerY = 0;
    radius = 400;
    pointM = { x: centerX + radius, y: centerY };
    boundaryRadius = Math.min(width, height) * 0.2;
    orbitY = -Math.PI / 6;
    centerOrbitY = -Math.PI / 6;

    loadAssets();

    // Create 21 options
    for (let i = 0; i < numOptions; i++) {
      const angle = (i / numOptions) * Math.PI * 2;
      options.push(new Option(angle, optionImages[i], i));
    }

    initThreeJS();
    bindEvents();
    requestAnimationFrame(animate);
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    uiCanvas.width = width * dpr;
    uiCanvas.height = height * dpr;
    uiCanvas.style.width = width + 'px';
    uiCanvas.style.height = height + 'px';

    if (renderer && camera) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    }

    boundaryRadius = Math.min(width, height) * 0.3;
  }

  // --- Animation Loop ---
  function animate() {
    frameCount++;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Clear 2D Canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    // Scale & coordinate origin at center to match p5 WEBGL coordinates
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, (width * dpr) / 2, (height * dpr) / 2);

    if (currentPage === "main") {
      mainSceneGroup.visible = true;
      resultSceneGroup.visible = false;

      drawMainPage();
      updateMain3DScene();
    } else if (currentPage === "loading") {
      mainSceneGroup.visible = false;
      resultSceneGroup.visible = false;

      drawLoadingPage();
    } else if (currentPage === "result") {
      mainSceneGroup.visible = false;
      resultSceneGroup.visible = true;

      drawResultPage();
      updateResult3DScene();
    }

    ctx.restore();

    // Render Three.js WebGL Scene
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  }

  // --- Main Page Logic & Rendering ---
  function drawMainPage() {

    drawParallaxGrid();
    drawBackgroundRipples();
    drawCenterImage();

    enlargedOption = null;
    drawTitle();
    drawResetButton();

    for (const option of options) {
      option.update();
      if (option.x > 0) {
        option.display();
        const relMouseX = mouseX - width / 2;
        const relMouseY = mouseY - height / 2;
        if (dist(relMouseX, relMouseY, option.x, option.y) < option.size / 2 || option.isAtPointM()) {
          enlargedOption = option;
        }
      }
    }

    checkModelHover();
    modelRotation += 0.01;

    if (enlargedOption !== null) {
      if (dots.length === 0) createDots();
      drawDots();
      displayDetailImage();
    } else {
      dots = [];
      hoveredDot = null;
    }

    // Top-Right Selections Count Text
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`Selections: ${currentSelections}/${maxSelections}`, width / 2 - 20, -height / 2 + 20);
    ctx.restore();

    drawPresentButton();
    drawSelectionCounter();
  }

  function updateMain3DScene() {
    // 1. Center Wireframe Chair
    if (centerChairMeshGroup) {
      centerChairMeshGroup.position.set(-70, 0, 50);
      centerChairMeshGroup.rotation.set(0, 0, 0);

      if (orbitControlEnabled && isMouseOverCenter) {
        centerChairMeshGroup.rotation.x = centerOrbitY;
        centerChairMeshGroup.rotation.y = centerOrbitX;
      } else {
        centerChairMeshGroup.rotation.x = -Math.PI / 6;
        centerChairMeshGroup.rotation.y = modelRotation;
      }

      // Unified Blender World Scale (80)
      centerChairMeshGroup.scale.set(80, 80, 80);
    }

    // 2. Option Models
    for (let i = 0; i < numOptions; i++) {
      const mesh = optionMeshes[i];
      if (!mesh) continue;

      if (enlargedOption !== null && enlargedOption.id === i) {
        mesh.visible = true;

        mesh.position.set(-70, 0, 50);
        mesh.rotation.set(0, 0, 0);

        if (orbitControlEnabled && isMouseOverModel) {
          mesh.rotation.x = orbitY;
          mesh.rotation.y = orbitX;
        } else {
          mesh.rotation.x = -Math.PI / 6;
          mesh.rotation.y = modelRotation;
        }

        // Unified Blender World Scale (80)
        mesh.scale.set(80, 80, 80);
      } else {
        mesh.visible = false;
      }
    }
  }

  // --- Background Grid & Ripples ---
  function drawParallaxGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'; // 35/255
    ctx.lineWidth = 1;

    const cols = Math.ceil(width / gridSpacing) + 2;
    const rows = Math.ceil(height / gridSpacing) + 2;

    const time = Date.now() * 0.0002;
    gridOffset.x = Math.sin(time) * 30 + (mouseX - width / 2) * 0.005;
    gridOffset.y = Math.cos(time) * 30 + (mouseY - height / 2) * 0.005;

    for (let i = -cols; i < cols; i++) {
      const x = i * gridSpacing + gridOffset.x;
      ctx.beginPath();
      ctx.moveTo(x - width / 2, -height);
      ctx.lineTo(x - width / 2, height);
      ctx.stroke();
    }

    for (let j = -rows; j < rows; j++) {
      const y = j * gridSpacing + gridOffset.y;
      ctx.beginPath();
      ctx.moveTo(-width, y - height / 2);
      ctx.lineTo(width, y - height / 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBackgroundRipples() {
    ctx.save();
    for (let i = rippleHistory.length - 1; i >= 0; i--) {
      const ripple = rippleHistory[i];
      ripple.radius += 1.5;
      ripple.alpha -= rippleFadeSpeed * 255;

      ctx.beginPath();
      ctx.arc(ripple.x - width / 2, ripple.y - height / 2, ripple.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, ripple.alpha / 255)})`;
      ctx.stroke();

      if (ripple.alpha <= 0) {
        rippleHistory.splice(i, 1);
      }
    }
    ctx.restore();
  }

  function drawCenterImage() {
    ctx.save();
    drawCenteredImage(centerImage, -100 + 20, 0, 720, 680);
    ctx.restore();
  }

  function drawTitle() {
    ctx.save();
    ctx.translate(-width / 2 + 50, -height / 2 + 60);

    ctx.font = '70px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // "CHAIR" in white
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHAIR', 0, 0);

    const chairWidth = ctx.measureText('CHAIR').width;

    // "DE OLOGY" in black
    ctx.fillStyle = '#000000';
    ctx.fillText('DE OLOGY', chairWidth, 0);

    // Subtitle
    ctx.font = '25px Kollektif-Bold, sans-serif';
    ctx.fillText('DESIGN HOW YOU SIT', 5, 90);

    ctx.restore();
  }

  function drawResetButton() {
    resetButtonX = width / 2 - 100;
    resetButtonY = -height / 2 + 60;

    ctx.save();
    if (isMouseOverResetButton()) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.78)'; // hover
    } else {
      ctx.fillStyle = 'rgba(180, 0, 0, 0.59)'; // normal
    }

    ctx.fillRect(resetButtonX - resetButtonWidth / 2, resetButtonY - resetButtonHeight / 2, resetButtonWidth, resetButtonHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RESET', resetButtonX, resetButtonY);

    ctx.restore();
  }

  function isMouseOverResetButton() {
    const relX = mouseX - width / 2;
    const relY = mouseY - height / 2;
    return (
      relX > resetButtonX - resetButtonWidth / 2 &&
      relX < resetButtonX + resetButtonWidth / 2 &&
      relY > resetButtonY - resetButtonHeight / 2 &&
      relY < resetButtonY + resetButtonHeight / 2
    );
  }

  function resetAllSelections() {
    for (let groupIndex = 0; groupIndex < optionGroups.length; groupIndex++) {
      resetOptionGroup(groupIndex);
    }
    currentSelections = 0;
    for (let i = 0; i < options.length; i++) {
      options[i].isSelected = false;
      options[i].isActive = true;
      selectedOptions[i] = false;
    }
  }

  function handleOptionSelection(selectedOption) {
    if (selectedOption.isSelected) {
      resetOptionGroup(selectedOption.groupIndex);
      return;
    }

    if (currentSelections >= maxSelections) {
      return;
    }

    selectedOption.isSelected = true;
    selectedOptions[selectedOption.id] = true;
    currentSelections++;

    const group = optionGroups[selectedOption.groupIndex];
    for (const optionId of group) {
      if (optionId !== selectedOption.id) {
        options[optionId].isActive = false;
      }
    }
  }

  function resetOptionGroup(groupIndex) {
    const group = optionGroups[groupIndex];
    if (options[group[0]].isSelected || options[group[1]].isSelected || options[group[2]].isSelected) {
      currentSelections--;
    }
    for (const optionId of group) {
      options[optionId].isSelected = false;
      options[optionId].isActive = true;
      selectedOptions[optionId] = false;
    }
  }

  // --- Present Button & Counter Badge ---
  function drawPresentButton() {
    isButtonActive = currentSelections >= minSelections;

    presentButtonX = -width / 2 + 260;
    presentButtonY = 0;

    ctx.save();
    if (isButtonActive) {
      drawCenteredImage(presentButtonImage, presentButtonX, presentButtonY, presentButtonWidth, presentButtonHeight);

      // Active pulse animation
      const pulseWidth = presentButtonWidth * (1 + 0.03 * Math.sin(frameCount * 0.05));
      const pulseHeight = presentButtonHeight * (1 + 0.03 * Math.sin(frameCount * 0.05));

      ctx.beginPath();
      ctx.ellipse(presentButtonX, presentButtonY, pulseWidth / 2, pulseHeight / 2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.39)';
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.globalAlpha = 100 / 255;
      drawCenteredImage(presentButtonImage, presentButtonX, presentButtonY, presentButtonWidth, presentButtonHeight);
    }
    ctx.restore();
  }

  function drawSelectionCounter() {
    const counterX = width / 2 - 80;
    const counterY = height / 2 - 60;
    const counterSize = 100;

    const mouseRelX = mouseX - width / 2;
    const mouseRelY = mouseY - height / 2;

    isCounterHovered = dist(mouseRelX, mouseRelY, counterX, counterY) < counterSize / 2;

    ctx.save();
    const displaySize = isCounterHovered ? counterSize * 1.2 : counterSize;

    // Circle background
    ctx.beginPath();
    ctx.arc(counterX, counterY, displaySize / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.59)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${isCounterHovered ? 36 : 30}px Kollektif-Bold, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentSelections}/${maxSelections}`, counterX, counterY);

    drawSelectionPanel();
    ctx.restore();

    if (panelClickBlockTimer > 0) {
      panelClickBlockTimer--;
    }
  }

  function drawSelectionPanel() {
    panelPosition += (panelTargetPosition - panelPosition) * panelEasing;

    if (panelPosition < 0.01 && panelTargetPosition === 0) {
      panelPosition = 0;
      return;
    }

    const panelX = width / 2 - panelWidth * (1 - panelPosition);

    ctx.save();
    ctx.fillStyle = 'rgba(30, 30, 10, 0.9)';
    ctx.fillRect(panelX, -height / 2, panelWidth, height);

    // Close button
    const closeButtonX = panelX + panelWidth - 30;
    const closeButtonY = -height / 2 + 30;

    const mouseRelX = mouseX - width / 2;
    const mouseRelY = mouseY - height / 2;
    const isCloseHovered = dist(mouseRelX, mouseRelY, closeButtonX, closeButtonY) < 15;

    ctx.fillStyle = isCloseHovered ? '#ffffff' : '#c8c8c8';
    ctx.font = '24px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeButtonX, closeButtonY);

    displaySelectedOptionsInPanel(panelX + panelWidth / 2, -height / 2 + 100);
    ctx.restore();
  }

  function displaySelectedOptionsInPanel(panelCenterX, startY) {
    let selectedCount = 0;
    const spacing = 150;

    ctx.save();
    ctx.fillStyle = '#c8c8c8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = '25px Kollektif-Bold, sans-serif';
    ctx.fillText('Selected Designs', panelCenterX, startY - 20);

    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i]) {
        const optionY = startY + selectedCount * spacing;

        // Render small thumbnail representation
        if (optionImages[i] && optionImages[i].complete) {
          drawCenteredImage(optionImages[i], panelCenterX, optionY + 70, 70, 70);
        }

        selectedCount++;
      }
    }

    if (selectedCount === 0) {
      ctx.fillStyle = '#c8c8c8';
      ctx.font = '16px Kollektif-Bold, sans-serif';
      ctx.fillText('No designs selected yet', panelCenterX, startY + 50);
    }
    ctx.restore();
  }

  // --- Interactive Dots & Details ---
  function createDots() {
    dots = [];
    let attempts = 0;
    const minDist = dotRadius * 12;
    const maxAttempts = 100;

    while (dots.length < 3 && attempts < maxAttempts) {
      const angle = Math.random() * Math.PI * 2;
      const distance = map(Math.random(), 0, 1, boundaryRadius * 0.2, boundaryRadius * 0.8);
      const x = distance * Math.cos(angle);
      const y = distance * Math.sin(angle);

      let valid = true;
      for (const other of dots) {
        if (dist(x, y, other.x, other.y) < minDist) {
          valid = false;
          break;
        }
      }

      if (valid) {
        dots.push({ x, y, id: dots.length, hovered: false });
      }
      attempts++;
    }
  }

  function drawDots() {
    hoveredDot = null;
    ctx.save();

    const boundaryMouseX = mouseX - width / 2 + 100;
    const boundaryMouseY = mouseY - height / 2;

    for (const dot of dots) {
      dot.hovered = dist(boundaryMouseX, boundaryMouseY, dot.x, dot.y) < dotRadius;
      if (dot.hovered) hoveredDot = dot;

      const pulseScale = map(Math.sin(frameCount * dotPulseSpeed + dot.id * 0.5), -1, 1, dotMinScale, dotMaxScale);
      const finalRadius = dot.hovered ? dotRadius * 1.5 * pulseScale : dotRadius * pulseScale;

      let opacity = 255;
      if (dot.hovered) {
        opacity = map(Math.sin(frameCount * dotPulseSpeed * 2 + dot.id), -1, 1, 100, 255);
      } else {
        opacity = map(pulseScale, dotMinScale, dotMaxScale, 200, 255);
      }

      ctx.beginPath();
      ctx.arc(-100 + dot.x, dot.y, finalRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity / 255})`;
      ctx.fill();
    }
    ctx.restore();
  }

  function displayDetailImage() {
    if (hoveredDot && enlargedOption) {
      const detailImg = detailImages[enlargedOption.id][hoveredDot.id];
      if (detailImg && detailImg.complete) {
        ctx.save();
        drawCenteredImage(detailImg, -100 + hoveredDot.x, hoveredDot.y, 400, 400);
        ctx.restore();
      }
    }
  }

  function checkModelHover() {
    isMouseOverCenter = false;
    isMouseOverModel = false;

    const centerScreenPos = worldToScreen({ x: -70, y: 0, z: 50 });
    isMouseOverCenter = dist(mouseX, mouseY, centerScreenPos.x, centerScreenPos.y) < 200;

    if (enlargedOption !== null) {
      const modelScreenPos = worldToScreen({ x: -70, y: 0, z: 50 });
      isMouseOverModel = dist(mouseX, mouseY, modelScreenPos.x, modelScreenPos.y) < 200;
    }
  }

  function worldToScreen(pos) {
    const screenX = width / 2 + pos.x - pos.z * 0.5;
    const screenY = height / 2 - pos.y - pos.z * 0.5;
    return { x: screenX, y: screenY };
  }

  // --- Loading Page ---
  function drawLoadingPage() {
    ctx.save();

    const elapsed = Date.now() - loadingStartTime;
    const progress = constrain(elapsed / loadingDuration, 0, 1);

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Preparing your result...', 0, -50);

    // Progress Bar
    const barWidth = 400;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(-barWidth / 2, 0, barWidth, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-barWidth / 2, 0, barWidth * progress, 20);

    ctx.restore();

    if (progress >= 1) {
      currentPage = "result";
    }
  }

  // --- Result Page Logic & Rendering ---
  function drawResultPage() {

    drawParallaxGrid();
    drawBackgroundRipples();

    if (!sittingStyleResult) {
      sittingStyleResult = calculateSittingStyle();
    }

    ctx.save();

    // Left side - Sitting Style
    ctx.save();
    ctx.translate(-width / 6, 0);

    const styleImg = styleImages[sittingStyleResult.styleIndex];
    if (styleImg && styleImg.complete) {
      const imgWidth = Math.min(width / 2 - 40, styleImg.width);
      const imgHeight = (imgWidth / styleImg.width) * styleImg.height;
      drawCenteredImage(styleImg, 0, 0, imgWidth, imgHeight);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '60px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('YOUR SITTING STYLE IS', -width / 4, -height / 2.5);
    ctx.restore();

    drawDownloadButton();
    drawBackButton();

    ctx.restore();

    modelRotation += 0.01;
  }

  function updateResult3DScene() {
    const selectedIds = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i]) selectedIds.push(i);
    }

    // Hide main scene option meshes
    for (let i = 0; i < numOptions; i++) {
      const mesh = optionMeshes[i];
      if (mesh) mesh.visible = false;
    }

    // Position result models at world (width/6, 0, 200)
    resultSceneGroup.position.set(width / 6, 0, 200);
    resultSceneGroup.rotation.set(-Math.PI / 6, modelRotation, 0);

    // Synchronize meshes inside resultSceneGroup
    while (resultSceneGroup.children.length > 3) { // keep ambient & directional lights
      resultSceneGroup.remove(resultSceneGroup.children[3]);
    }

    for (const id of selectedIds) {
      const originalMesh = optionMeshes[id];
      if (originalMesh) {
        const clone = originalMesh.clone();
        clone.visible = true;
        const offset = modelOffsets[id];
        const modelScale = modelScales[id];

        clone.position.set(0, 0, 0);
        clone.scale.set(80, 80, 80);
        resultSceneGroup.add(clone);
      }
    }
  }

  function drawBackButton() {
    const backButtonX = 0;
    const backButtonY = height / 3 - 30;

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.font = '24px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Back', backButtonX, backButtonY);
    ctx.restore();
  }

  function drawDownloadButton() {
    const downloadButtonX = width / 2 - 100;
    const downloadButtonY = height / 2 - 50;

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.font = '20px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Download Design', downloadButtonX, downloadButtonY);
    ctx.restore();
  }

  function downloadModel() {
    const selectedIds = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i]) selectedIds.push(i);
    }

    const modelData = {
      title: "My Custom Chair Design",
      date: new Date().toISOString(),
      selectedParts: selectedIds,
      offsets: selectedIds.map(id => modelOffsets[id]),
      scales: selectedIds.map(id => modelScales[id])
    };

    const jsonData = JSON.stringify(modelData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'chair_design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function calculateSittingStyle() {
    let imaginativeScore = 0;
    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i]) {
        imaginativeScore += optionImaginativeValues[i];
      }
    }
    const imaginativeFactor = imaginativeScore > 6 ? "N" : "S";

    let moralYesCount = 0;
    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i] && optionMoralValues[i] === "yes") {
        moralYesCount++;
      }
    }
    const moralFactor = moralYesCount >= 4 ? "F" : "T";
    const decisionFactor = totalScrollAmount > 8000 ? "P" : "J";

    let styleIndex;
    if (imaginativeFactor === "N") {
      if (moralFactor === "T") {
        styleIndex = decisionFactor === "P" ? 0 : 1;
      } else {
        styleIndex = decisionFactor === "P" ? 2 : 3;
      }
    } else {
      if (moralFactor === "T") {
        styleIndex = decisionFactor === "P" ? 6 : 4;
      } else {
        styleIndex = decisionFactor === "P" ? 7 : 5;
      }
    }

    return {
      styleIndex: styleIndex,
      personalityCode: imaginativeFactor + moralFactor + decisionFactor
    };
  }

  // --- Event Handling ---
  function bindEvents() {
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (rippleHistory.length < maxRipples) {
        rippleHistory.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          alpha: 200
        });
      }
    });

    window.addEventListener('mousedown', (e) => {
      const relMouseX = mouseX - width / 2;
      const relMouseY = mouseY - height / 2;

      if (currentPage === "main") {
        if (isMouseOverResetButton()) {
          resetAllSelections();
          return;
        }

        if (isPanelOpen) {
          const panelX = width / 2 - panelWidth * (1 - panelPosition);
          if (relMouseX > panelX && relMouseX < width / 2) {
            const closeButtonX = panelX + panelWidth - 30;
            const closeButtonY = -height / 2 + 30;
            if (dist(relMouseX, relMouseY, closeButtonX, closeButtonY) < 15) {
              panelTargetPosition = 0;
              isPanelOpen = false;
              panelClickBlockTimer = 10;
              return;
            }
            return;
          }
        }

        const counterX = width / 2 - 80;
        const counterY = height / 2 - 60;
        if (isCounterHovered && panelClickBlockTimer === 0) {
          panelTargetPosition = isPanelOpen ? 0 : 1;
          isPanelOpen = !isPanelOpen;
          panelClickBlockTimer = 10;
          return;
        }

        if (
          isButtonActive &&
          relMouseX > presentButtonX - presentButtonWidth / 2 &&
          relMouseX < presentButtonX + presentButtonWidth / 2 &&
          relMouseY > presentButtonY - presentButtonHeight / 2 &&
          relMouseY < presentButtonY + presentButtonHeight / 2
        ) {
          currentPage = "loading";
          loadingStartTime = Date.now();
          return;
        }

        if (isMouseOverModel || isMouseOverCenter) {
          orbitControlEnabled = true;
          prevMouseX = mouseX;
          prevMouseY = mouseY;
          return;
        }

        for (const option of options) {
          if ((option.isAtPointM() || dist(relMouseX, relMouseY, option.x, option.y) < option.size / 2) && option.isActive) {
            handleOptionSelection(option);
            break;
          }
        }
      } else if (currentPage === "result") {
        const backButtonX = 0;
        const backButtonY = height / 3 - 30;

        if (
          relMouseX > backButtonX - 50 && relMouseX < backButtonX + 50 &&
          relMouseY > backButtonY - 15 && relMouseY < backButtonY + 15
        ) {
          currentPage = "main";
          sittingStyleResult = null;
          totalScrollAmount = 0;
          isPanelOpen = false;
          panelPosition = 0;
          panelTargetPosition = 0;
          return;
        }

        const downloadButtonX = width / 2 - 100;
        const downloadButtonY = height / 2 - 50;
        const downloadButtonWidth = 150;
        const downloadButtonHeight = 30;

        if (
          relMouseX > downloadButtonX - downloadButtonWidth && relMouseX < downloadButtonX &&
          relMouseY > downloadButtonY - downloadButtonHeight && relMouseY < downloadButtonY
        ) {
          downloadModel();
          return;
        }
      }
    });

    window.addEventListener('mouseup', () => {
      orbitControlEnabled = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (currentPage !== "main") return;

      if (orbitControlEnabled) {
        const deltaX = (mouseX - prevMouseX) * 0.01;
        const deltaY = (mouseY - prevMouseY) * 0.01;

        if (isMouseOverModel) {
          orbitX += deltaX;
          orbitY -= deltaY;
          orbitY = constrain(orbitY, -Math.PI / 2, 0);
        }

        if (isMouseOverCenter) {
          centerOrbitX += deltaX;
          centerOrbitY -= deltaY;
          centerOrbitY = constrain(centerOrbitY, -Math.PI / 2, 0);
        }

        prevMouseX = mouseX;
        prevMouseY = mouseY;
      }
    });

    window.addEventListener('wheel', (e) => {
      if (currentPage !== "main") return;
      angleOffset += e.deltaY * 0.001;
      totalScrollAmount += Math.abs(e.deltaY);
    });

    window.addEventListener('keydown', (e) => {
      if (enlargedOption !== null) {
        const id = enlargedOption.id;
        const offset = modelOffsets[id];
        const moveStep = e.shiftKey ? offsetStep / 2 : offsetStep;

        if (e.key === 'ArrowLeft') offset.x -= moveStep;
        if (e.key === 'ArrowRight') offset.x += moveStep;
        if (e.key === 'ArrowUp') offset.y -= moveStep;
        if (e.key === 'ArrowDown') offset.y += moveStep;
        if (e.key === 'w' || e.key === 'W') offset.z -= moveStep;
        if (e.key === 's' || e.key === 'S') offset.z += moveStep;
        if (e.key === 'r' || e.key === 'R') modelOffsets[id] = { x: 0, y: 0, z: 0 };

        const scaleStep = e.shiftKey ? 0.05 : 0.1;
        if (e.key === '+' || e.key === '=') modelScales[id] += scaleStep;
        if (e.key === '-' || e.key === '_') modelScales[id] -= scaleStep;
        if (e.key === '0') modelScales[id] = 1;

        modelScales[id] = Math.max(0.1, modelScales[id]);
      }
    });
  }

  // --- Initialize on DOM Load ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
