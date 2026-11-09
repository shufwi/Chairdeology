// Chair De Ology - Three.js Application Core
(function () {
  'use strict';

  const numOptions = 21;
  const maxSelections = 7;
  const minSelections = 5;
  const loadingDuration = 900;
  const debugMode = /[?&]debug=1(?:&|$)/.test(window.location.search);

  const GROUP_META = [
    { name: 'Heart', prompt: 'The resting core of your being.' },
    { name: 'Legs', prompt: 'How does it meet the ground?' },
    { name: 'Spine', prompt: 'What holds you upright?' },
    { name: 'Arms', prompt: 'Where your muscles rest.' },
    { name: 'Head', prompt: 'Where your mind rests.' },
    { name: 'Top', prompt: 'What covers your head?' },
    { name: 'Add-ons', prompt: 'What additional features does it have?' }
  ];

  const OPTIONS = [
    { imaginative: 0, moral: 'yes', offset: { x: -10, y: 0, z: 0 }, scale: 1 },
    { imaginative: 0, moral: 'yes', offset: { x: -20, y: 5, z: 0 }, scale: 1 },
    { imaginative: 2, moral: 'no', offset: { x: -5, y: 10, z: 10 }, scale: 1 },
    { imaginative: 0, moral: 'yes', offset: { x: 0, y: 85, z: 0 }, scale: 1 },
    { imaginative: 1, moral: 'no', offset: { x: 0, y: 80, z: 0 }, scale: 1.3 },
    { imaginative: 1, moral: 'no', offset: { x: 5, y: 75, z: 0 }, scale: 1.6 },
    { imaginative: 0, moral: 'no', offset: { x: 90, y: -105, z: 0 }, scale: 1 },
    { imaginative: 0, moral: 'yes', offset: { x: 75, y: -100, z: 0 }, scale: 1 },
    { imaginative: 0, moral: 'yes', offset: { x: 70, y: -90, z: 0 }, scale: 1 },
    { imaginative: 0, moral: 'no', offset: { x: 15, y: -35, z: 0 }, scale: 1.2 },
    { imaginative: 1, moral: 'no', offset: { x: -5, y: -40, z: 0 }, scale: 1.3 },
    { imaginative: 1, moral: 'no', offset: { x: -30, y: -40, z: 50 }, scale: 1.1 },
    { imaginative: 0, moral: 'yes', offset: { x: 80, y: -195, z: 0 }, scale: 0.8 },
    { imaginative: 1, moral: 'yes', offset: { x: 90, y: -240, z: 0 }, scale: 1 },
    { imaginative: 2, moral: 'yes', offset: { x: 95, y: -240, z: 0 }, scale: 1 },
    { imaginative: 1, moral: 'no', offset: { x: 20, y: -190, z: 20 }, scale: 2 },
    { imaginative: 2, moral: 'no', offset: { x: -20, y: -265, z: 0 }, scale: 1.7 },
    { imaginative: 2, moral: 'yes', offset: { x: -20, y: -235, z: 0 }, scale: 0.5 },
    { imaginative: 1, moral: 'yes', offset: { x: -130, y: 65, z: 0 }, scale: 1 },
    { imaginative: 2, moral: 'no', offset: { x: 110, y: 5, z: 0 }, scale: 0.5 },
    { imaginative: 2, moral: 'no', offset: { x: 135, y: -85, z: 0 }, scale: 2.5 }
  ];

  const SITTING_STYLES = [
    {
      name: 'Gangster',
      code: 'NTP',
      tagline: 'You sit like a claim on the room.',
      body: 'Leaning in, one knee up, attention sharp. You pick the unexpected line and commit to it. The chair is a stance, not furniture.'
    },
    {
      name: 'Loner',
      code: 'NTJ',
      tagline: 'You sit at a distance you designed yourself.',
      body: 'A folded, self-contained posture. You inspect every piece, then choose the quietest structure that still holds. Company is optional; alignment is not.'
    },
    {
      name: 'Nanny',
      code: 'NFP',
      tagline: 'You sit in a way that makes space for someone else.',
      body: 'Cross-legged, gathering. Your chair is a nest of generous parts — odd, warm, and built to hold more than one story at a time.'
    },
    {
      name: 'Yoga man',
      code: 'NFJ',
      tagline: 'You sit as if the body were a question to answer.',
      body: 'Contorted, precise, a little theatrical. You want the chair to mean something, and you will bend until the meaning fits.'
    },
    {
      name: 'Backpained',
      code: 'STJ',
      tagline: 'You sit with the honesty of a sore spine.',
      body: 'Practical choices, then the bill comes due. You finish the set, you pick what works, and the chair tells the truth about how hard you sit.'
    },
    {
      name: 'Budha',
      code: 'SFJ',
      tagline: 'You sit until the room settles around you.',
      body: 'Centered, unhurried. You favor pieces that feel kind, then stay with them. The chair is a still point, not a performance.'
    },
    {
      name: 'Chairperson',
      code: 'STP',
      tagline: 'You sit as if the meeting already started.',
      body: 'Upright, crossed, in charge of the stool. You browse widely, decide in motion, and treat the chair like a tool you already know how to use.'
    },
    {
      name: 'Frog',
      code: 'SFP',
      tagline: 'You sit ready to leave — or to leap.',
      body: 'Low, wide, alert. You keep options open, follow the lively part, and let the chair stay a little wild at the edges.'
    }
  ];

  const optionGroups = [];
  for (let i = 0; i < 7; i++) {
    optionGroups.push([i * 3, i * 3 + 1, i * 3 + 2]);
  }

  let currentPage = 'main';
  let frameCount = 0;
  let currentSelections = 0;
  const selectedOptions = Array(21).fill(false);

  const behavior = {
    focusedIds: new Set(),
    seenDetails: new Set(),
    groupResets: 0,
    sessionStart: Date.now()
  };

  let centerX = 0, centerY = 0, radius = 400;
  let angleOffset = 0;
  let pointM = { x: radius, y: 0 };
  let enlargedOption = null;

  let modelRotation = 0;
  let orbitControlEnabled = false;
  let orbitX = 0, orbitY = Math.PI / 5;
  let centerOrbitX = 0, centerOrbitY = Math.PI / 5;
  let prevMouseX = 0, prevMouseY = 0;
  let isMouseOverModel = false;
  let isMouseOverCenter = false;

  let isPanelOpen = false;
  let panelPosition = 0;
  let panelTargetPosition = 0;
  let panelWidth = 300;
  let panelTurntableAngle = 0;

  let sittingStyleResult = null;
  let resultChairBuilt = false;
  let introOpen = true;
  let ringDrag = null;

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

  let webglCanvas, uiCanvas, ctx;
  let width = window.innerWidth, height = window.innerHeight;
  let mouseX = width / 2, mouseY = height / 2;

  const optionImages = [];
  const detailImages = [];
  const styleImages = [];
  let centerImage = null;

  let scene, camera, renderer;
  let centerChairMeshGroup = null;
  let chairRig = null;
  let assemblyRoot = null;
  let previewRoot = null;
  let panelChairRoot = null;
  let previewOptionId = null;
  let assemblySignature = '';
  let panelSignature = '';
  let raycaster = null;
  let pointerStart = null;
  const chairScale = 80;
  const chairTilt = Math.PI / 5;
  const panelChairScale = 36;
  const optionMeshes = [];
  const panelOptionMeshes = [];
  let mainSceneGroup = null;
  let panelSceneGroup = null;
  let panelBgMesh = null;
  let resultSceneGroup = null;
  let resultChairRoot = null;

  const hud = {};

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
        ctx.globalAlpha = this.opacity / 255;
        drawCenteredImage(this.img, 0, 0, this.size, this.size);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (70 / 255) * (this.opacity / 255);
        drawCenteredImage(this.img, 0, 0, this.size * 0.9, this.size * 0.9);
        ctx.restore();

        const pulseSize = this.size * (0.8 + 0.2 * Math.sin(frameCount * 0.06));
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(this.opacity / 255) * 0.8})`;
        ctx.stroke();
      } else {
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

  function loadAssets() {
    for (let i = 1; i <= numOptions; i++) {
      const img = new Image();
      img.src = `Thumbnails/opt${i}.png`;
      optionImages.push(img);

      const dA = new Image(); dA.src = `Assets/Details/detailA_${i}.png`;
      const dB = new Image(); dB.src = `Assets/Details/detailB_${i}.png`;
      const dC = new Image(); dC.src = `Assets/Details/detailC_${i}.png`;
      detailImages[i - 1] = [dA, dB, dC];
    }

    centerImage = new Image();
    centerImage.src = 'Assets/White ring.png';

    for (let i = 1; i <= 8; i++) {
      const img = new Image();
      img.src = `Assets/Style/Style_${i}.png`;
      styleImages.push(img);
    }
  }

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
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    mainSceneGroup = new THREE.Group();
    panelSceneGroup = new THREE.Group();
    resultSceneGroup = new THREE.Group();
    resultChairRoot = new THREE.Group();
    resultSceneGroup.add(resultChairRoot);

    chairRig = new THREE.Group();
    assemblyRoot = new THREE.Group();
    previewRoot = new THREE.Group();
    chairRig.add(assemblyRoot);
    chairRig.add(previewRoot);
    mainSceneGroup.add(chairRig);

    panelChairRoot = new THREE.Group();
    panelSceneGroup.add(panelChairRoot);

    scene.add(mainSceneGroup);
    scene.add(panelSceneGroup);
    scene.add(resultSceneGroup);

    raycaster = new THREE.Raycaster();

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    mainSceneGroup.add(ambientLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(200, 300, 500);
    mainSceneGroup.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xaaaaaa, 0.3);
    dirLight2.position.set(-200, -100, 300);
    mainSceneGroup.add(dirLight2);

    const panelAmbient = new THREE.AmbientLight(0xffffff, 0.85);
    panelSceneGroup.add(panelAmbient);
    const panelDir1 = new THREE.DirectionalLight(0xffffff, 0.75);
    panelDir1.position.set(200, 200, 400);
    panelSceneGroup.add(panelDir1);
    const panelDir2 = new THREE.DirectionalLight(0x888888, 0.4);
    panelDir2.position.set(-100, -100, 200);
    panelSceneGroup.add(panelDir2);

    const panelBgGeom = new THREE.PlaneGeometry(1, 1);
    const panelBgMat = new THREE.MeshBasicMaterial({
      color: 0x181818,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    panelBgMesh = new THREE.Mesh(panelBgGeom, panelBgMat);
    panelSceneGroup.add(panelBgMesh);

    const resAmbient = new THREE.AmbientLight(0xffffff, 0.7);
    resultSceneGroup.add(resAmbient);
    const resDir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    resDir1.position.set(200, 300, 500);
    resultSceneGroup.add(resDir1);
    const resDir2 = new THREE.DirectionalLight(0xaaaaaa, 0.5);
    resDir2.position.set(-200, -100, 300);
    resultSceneGroup.add(resDir2);

    const objLoader = new THREE.OBJLoader();

    function parseAndNormalizeOBJ(objText, material) {
      const group = objLoader.parse(objText);
      group.traverse((child) => {
        if (child.isMesh && material) {
          child.material = material;
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
          const solidMesh = new THREE.Mesh(geom, solidMat);
          solidMesh.renderOrder = -1;
          centerChairMeshGroup.add(solidMesh);
          const wireframeGeom = new THREE.WireframeGeometry(geom);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
          });
          const lineSegments = new THREE.LineSegments(wireframeGeom, lineMat);
          lineSegments.renderOrder = -1;
          centerChairMeshGroup.add(lineSegments);
        }
      });
      chairRig.add(centerChairMeshGroup);
    }

    if (window.MODEL_DATA && window.MODEL_DATA.Default_Chair) {
      buildWireframeChair(objLoader.parse(window.MODEL_DATA.Default_Chair));
    } else {
      objLoader.load('Assets/Background/Default_Chair.obj', buildWireframeChair);
    }

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

        const panelOptionGroup = parseAndNormalizeOBJ(window.MODEL_DATA[key], optionMaterial.clone());
        panelOptionMeshes.push(panelOptionGroup);
        panelSceneGroup.add(panelOptionGroup);
        panelOptionGroup.visible = false;
      } else {
        const placeholderGroup = new THREE.Group();
        optionMeshes.push(placeholderGroup);
        mainSceneGroup.add(placeholderGroup);
        placeholderGroup.visible = false;

        const panelPlaceholder = new THREE.Group();
        panelOptionMeshes.push(panelPlaceholder);
        panelSceneGroup.add(panelPlaceholder);
        panelPlaceholder.visible = false;

        objLoader.load(`Assets/OBJ/Option${i}_P.obj`, (loadedGroup) => {
          loadedGroup.traverse((child) => {
            if (child.isMesh) {
              child.material = optionMaterial.clone();
            }
          });
          placeholderGroup.add(loadedGroup.clone(true));
          panelPlaceholder.add(loadedGroup.clone(true));
        });
      }
    }
  }

  function cacheHud() {
    hud.root = document.getElementById('hud');
    hud.result = document.getElementById('result-hud');
    hud.loading = document.getElementById('loading-hud');
    hud.loadingBar = document.getElementById('loading-bar');
    hud.intro = document.getElementById('intro');
    hud.hint = document.getElementById('hint');
    hud.reset = document.getElementById('btn-reset');
    hud.present = document.getElementById('btn-present');
    hud.presentHelp = document.getElementById('present-help');
    hud.tray = document.getElementById('btn-tray');
    hud.trayCount = document.getElementById('tray-count');
    hud.focusChip = document.getElementById('focus-chip');
    hud.styleName = document.getElementById('style-name');
    hud.styleTagline = document.getElementById('style-tagline');
    hud.styleBody = document.getElementById('style-body');
    hud.styleCode = document.getElementById('style-code');
    hud.back = document.getElementById('btn-back');
    hud.download = document.getElementById('btn-download');
    hud.begin = document.getElementById('btn-begin');
  }

  function refreshHud() {
    const onMain = currentPage === 'main';
    const onResult = currentPage === 'result';
    const onLoading = currentPage === 'loading';

    hud.root.classList.toggle('is-hidden', !onMain || introOpen);
    hud.result.classList.toggle('is-hidden', !onResult);
    hud.loading.classList.toggle('is-hidden', !onLoading);
    hud.intro.classList.toggle('is-hidden', !introOpen);
    document.body.classList.toggle('intro-open', introOpen);

    hud.trayCount.textContent = `${currentSelections}/${maxSelections}`;
    hud.present.disabled = currentSelections < minSelections;

    if (currentSelections < minSelections) {
      hud.presentHelp.textContent = `Choose at least ${minSelections} pieces · ${currentSelections} selected`;
    } else if (currentSelections >= maxSelections) {
      hud.presentHelp.textContent = 'Tray is full — open it to swap a piece, or present';
    } else {
      hud.presentHelp.textContent = 'Ready to present — or keep choosing';
    }

    if (onMain && enlargedOption && !isPanelOpen) {
      const group = GROUP_META[enlargedOption.groupIndex];
      hud.focusChip.classList.remove('is-hidden');
      hud.focusChip.textContent = `${group.name} · ${group.prompt}`;
    } else {
      hud.focusChip.classList.add('is-hidden');
    }

    if (onResult && sittingStyleResult) {
      const style = SITTING_STYLES[sittingStyleResult.styleIndex];
      hud.styleName.textContent = style.name;
      hud.styleTagline.textContent = style.tagline;
      hud.styleBody.textContent = style.body;
      hud.styleCode.textContent = sittingStyleResult.personalityCode;
    }
  }

  function setup() {
    uiCanvas = document.getElementById('ui-canvas');
    ctx = uiCanvas.getContext('2d');
    cacheHud();
    document.body.classList.toggle('intro-open', introOpen);
    refreshHud();
    resize();

    centerX = 0;
    centerY = 0;
    radius = 400;
    pointM = { x: centerX + radius, y: centerY };
    boundaryRadius = Math.min(width, height) * 0.2;
    orbitY = chairTilt;
    centerOrbitY = chairTilt;

    loadAssets();

    for (let i = 0; i < numOptions; i++) {
      const angle = (i / numOptions) * Math.PI * 2;
      options.push(new Option(angle, optionImages[i], i));
    }

    bindEvents();
    try {
      initThreeJS();
    } catch (err) {
      console.error('Three.js init failed', err);
    }
    if (/[?&]autotest=1(?:&|$)/.test(window.location.search)) {
      introOpen = false;
      document.body.classList.remove('intro-open');
      [0, 3, 6, 9, 12].forEach((id) => handleOptionSelection(options[id]));
      goToResult();
      loadingStartTime = Date.now() - loadingDuration;
      currentPage = 'result';
      refreshHud();
    }
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

  function animate() {
    frameCount++;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, (width * dpr) / 2, (height * dpr) / 2);

    if (currentPage === 'main') {
      mainSceneGroup.visible = true;
      resultSceneGroup.visible = false;
      drawMainPage();
      updateMain3DScene();
    } else if (currentPage === 'loading') {
      mainSceneGroup.visible = false;
      resultSceneGroup.visible = false;
      panelSceneGroup.visible = false;
      drawParallaxGrid();
      updateLoading();
    } else if (currentPage === 'result') {
      mainSceneGroup.visible = false;
      resultSceneGroup.visible = true;
      panelSceneGroup.visible = false;
      drawResultPage();
      updateResult3DScene();
    }

    ctx.restore();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function updateLoading() {
    const elapsed = Date.now() - loadingStartTime;
    const progress = constrain(elapsed / loadingDuration, 0, 1);
    if (hud.loadingBar) hud.loadingBar.style.width = `${progress * 100}%`;
    if (progress >= 1) {
      currentPage = 'result';
      refreshHud();
    }
  }

  let loadingStartTime = 0;

  function drawMainPage() {
    drawParallaxGrid();
    drawBackgroundRipples();
    drawCenterImage();

    enlargedOption = null;

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

    if (enlargedOption) {
      behavior.focusedIds.add(enlargedOption.id);
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

    drawSelectionPanel();
    updateCursor();

    if (frameCount % 8 === 0) refreshHud();
  }

  function updateCursor() {
    const mouseRelX = mouseX - width / 2;
    const mouseRelY = mouseY - height / 2;
    let cursorStyle = 'default';

    if (introOpen) {
      uiCanvas.style.cursor = 'default';
      return;
    }

    if (isPanelOpen) {
      const panelLeft = width / 2 - panelWidth * panelPosition;
      const closeBtnX = panelLeft + panelWidth - 30;
      const closeBtnY = -height / 2 + 35;
      if (dist(mouseRelX, mouseRelY, closeBtnX, closeBtnY) < 18) {
        cursorStyle = 'pointer';
      } else if (mouseRelX >= panelLeft && mouseRelX <= width / 2) {
        cursorStyle = 'pointer';
      }
    } else if (isMouseOverModel || isMouseOverCenter) {
      cursorStyle = orbitControlEnabled ? 'grabbing' : 'grab';
    } else {
      for (const option of options) {
        if (dist(mouseRelX, mouseRelY, option.x, option.y) < option.size / 2 || option.isAtPointM()) {
          cursorStyle = 'pointer';
          break;
        }
      }
    }
    uiCanvas.style.cursor = cursorStyle;
  }

  function clearGroup(group) {
    if (!group) return;
    while (group.children.length) group.remove(group.children[0]);
  }

  function tagPart(group, id) {
    group.userData.optionId = id;
    group.traverse((child) => {
      child.userData.optionId = id;
    });
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    group.visible = true;
    return group;
  }

  function clonePart(id) {
    const src = optionMeshes[id];
    if (!src) return null;
    return tagPart(src.clone(true), id);
  }

  function selectionSignature() {
    return getSelectedIds().join(',');
  }

  function setGhostStrength() {
    if (!centerChairMeshGroup) return;
    const filled = currentSelections > 0;
    centerChairMeshGroup.traverse((child) => {
      if (!child.material) return;
      if (child.isMesh) child.material.opacity = filled ? 0.07 : 0.22;
      if (child.isLineSegments) child.material.opacity = filled ? 0.22 : 0.65;
    });
  }

  function syncAssembly() {
    const signature = selectionSignature();
    if (signature === assemblySignature) return;
    clearGroup(assemblyRoot);
    getSelectedIds().forEach((id) => {
      const part = clonePart(id);
      if (part) assemblyRoot.add(part);
    });
    assemblySignature = signature;
    panelSignature = '';
    setGhostStrength();
  }

  function syncPreview() {
    const id = enlargedOption ? enlargedOption.id : null;
    const previewing = id != null && !selectedOptions[id];

    assemblyRoot.children.forEach((child) => {
      if (!previewing) {
        child.visible = true;
        return;
      }
      child.visible = Math.floor(child.userData.optionId / 3) !== Math.floor(id / 3);
    });

    if (!previewing) {
      if (previewOptionId != null) {
        clearGroup(previewRoot);
        previewOptionId = null;
      }
      return;
    }

    if (previewOptionId === id) return;
    clearGroup(previewRoot);
    const part = clonePart(id);
    if (!part) return;
    part.traverse((child) => {
      if (!child.material) return;
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.4;
      child.material.depthWrite = false;
    });
    previewRoot.add(part);
    previewOptionId = id;
  }

  function syncPanelChair(panelCenterX) {
    const signature = selectionSignature();
    if (signature !== panelSignature) {
      clearGroup(panelChairRoot);
      getSelectedIds().forEach((id) => {
        const part = clonePart(id);
        if (part) panelChairRoot.add(part);
      });
      panelSignature = signature;
    }

    panelChairRoot.visible = panelChairRoot.children.length > 0;
    panelChairRoot.position.set(panelCenterX, 16, 80);
    panelChairRoot.rotation.set(chairTilt, panelTurntableAngle, 0);
    panelChairRoot.scale.set(panelChairScale, panelChairScale, panelChairScale);
  }

  function applyChairPose() {
    if (!chairRig) return;
    chairRig.position.set(-70, 0, 50);
    if (orbitControlEnabled && (isMouseOverCenter || isMouseOverModel)) {
      chairRig.rotation.set(centerOrbitY, centerOrbitX, 0);
    } else {
      chairRig.rotation.set(chairTilt, modelRotation, 0);
    }
    chairRig.scale.set(chairScale, chairScale, chairScale);
  }

  function updateMain3DScene() {
    for (let i = 0; i < numOptions; i++) {
      if (optionMeshes[i]) optionMeshes[i].visible = false;
      if (panelOptionMeshes[i]) panelOptionMeshes[i].visible = false;
    }

    applyChairPose();
    syncAssembly();
    syncPreview();

    panelTurntableAngle += 0.02;
    if (panelPosition > 0.005) {
      panelSceneGroup.visible = true;
      const panelLeft = width / 2 - panelWidth * panelPosition;
      const panelCenterX = panelLeft + panelWidth / 2;

      if (panelBgMesh) {
        panelBgMesh.position.set(panelCenterX, 0, 0);
        panelBgMesh.scale.set(panelWidth, height, 1);
      }
      syncPanelChair(panelCenterX);
    } else {
      panelSceneGroup.visible = false;
      if (panelChairRoot) panelChairRoot.visible = false;
    }
  }

  function getSelectedIds() {
    const ids = [];
    for (let i = 0; i < selectedOptions.length; i++) {
      if (selectedOptions[i]) ids.push(i);
    }
    return ids;
  }

  function drawParallaxGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
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
      if (ripple.alpha <= 0) rippleHistory.splice(i, 1);
    }
    ctx.restore();
  }

  function drawCenterImage() {
    drawCenteredImage(centerImage, -80, 0, 720, 680);
  }

  function resetAllSelections() {
    for (let groupIndex = 0; groupIndex < optionGroups.length; groupIndex++) {
      resetOptionGroup(groupIndex, true);
    }
    currentSelections = 0;
    for (let i = 0; i < options.length; i++) {
      options[i].isSelected = false;
      options[i].isActive = true;
      selectedOptions[i] = false;
    }
    refreshHud();
  }

  function handleOptionSelection(selectedOption) {
    if (selectedOption.isSelected) {
      resetOptionGroup(selectedOption.groupIndex);
      return;
    }

    const group = optionGroups[selectedOption.groupIndex];
    const groupAlreadyChosen = group.some((optionId) => selectedOptions[optionId]);
    if (!groupAlreadyChosen && currentSelections >= maxSelections) return;

    if (groupAlreadyChosen) {
      group.forEach((optionId) => {
        options[optionId].isSelected = false;
        options[optionId].isActive = true;
        selectedOptions[optionId] = false;
      });
      currentSelections--;
    }

    selectedOption.isSelected = true;
    selectedOptions[selectedOption.id] = true;
    currentSelections++;

    group.forEach((optionId) => {
      if (optionId !== selectedOption.id) options[optionId].isActive = false;
    });
    refreshHud();
  }

  function resetOptionGroup(groupIndex, silent) {
    const group = optionGroups[groupIndex];
    const hadSelection = options[group[0]].isSelected || options[group[1]].isSelected || options[group[2]].isSelected;
    if (hadSelection) {
      currentSelections--;
      if (!silent) behavior.groupResets++;
    }
    for (const optionId of group) {
      options[optionId].isSelected = false;
      options[optionId].isActive = true;
      selectedOptions[optionId] = false;
    }
    refreshHud();
  }

  function drawSelectionPanel() {
    panelPosition += (panelTargetPosition - panelPosition) * 0.12;

    if (panelPosition < 0.005 && panelTargetPosition === 0) {
      panelPosition = 0;
      return;
    }

    const panelLeft = width / 2 - panelWidth * panelPosition;
    const panelCenterX = panelLeft + panelWidth / 2;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelLeft, -height / 2);
    ctx.lineTo(panelLeft, height / 2);
    ctx.stroke();

    const closeBtnX = panelLeft + panelWidth - 30;
    const closeBtnY = -height / 2 + 35;
    const mouseRelX = mouseX - width / 2;
    const mouseRelY = mouseY - height / 2;
    const isCloseHovered = dist(mouseRelX, mouseRelY, closeBtnX, closeBtnY) < 18;

    ctx.fillStyle = isCloseHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.55)';
    ctx.font = '24px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', closeBtnX, closeBtnY);

    displaySelectedOptionsInPanel(panelCenterX);
    ctx.restore();
  }

  function displaySelectedOptionsInPanel(panelCenterX) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Kollektif-Bold, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Your chair', panelCenterX, -height / 2 + 78);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '12px Kollektif-Bold, sans-serif';
    if (getSelectedIds().length > 0) {
      ctx.fillText('Click a part to lift it off', panelCenterX, height / 2 - 48);
    } else {
      ctx.fillText('Nothing built yet', panelCenterX, 8);
    }
  }

  function createDots() {
    dots = [];
    let attempts = 0;
    const minDist = dotRadius * 12;

    while (dots.length < 3 && attempts < 100) {
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
      if (valid) dots.push({ x, y, id: dots.length, hovered: false });
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
      if (dot.hovered) {
        hoveredDot = dot;
        if (enlargedOption) {
          behavior.seenDetails.add(`${enlargedOption.id}-${dot.id}`);
        }
      }

      const pulseScale = map(Math.sin(frameCount * dotPulseSpeed + dot.id * 0.5), -1, 1, dotMinScale, dotMaxScale);
      const finalRadius = dot.hovered ? dotRadius * 1.5 * pulseScale : dotRadius * pulseScale;
      const opacity = dot.hovered
        ? map(Math.sin(frameCount * dotPulseSpeed * 2 + dot.id), -1, 1, 100, 255)
        : map(pulseScale, dotMinScale, dotMaxScale, 200, 255);

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
        drawCenteredImage(detailImg, -100 + hoveredDot.x, hoveredDot.y, 400, 400);
      }
    }
  }

  function checkModelHover() {
    isMouseOverCenter = false;
    isMouseOverModel = false;
    const centerScreenPos = worldToScreen({ x: -70, y: 0, z: 50 });
    isMouseOverCenter = dist(mouseX, mouseY, centerScreenPos.x, centerScreenPos.y) < 200;
    if (enlargedOption !== null) {
      isMouseOverModel = dist(mouseX, mouseY, centerScreenPos.x, centerScreenPos.y) < 200;
    }
  }

  function worldToScreen(pos) {
    return {
      x: width / 2 + pos.x - pos.z * 0.5,
      y: height / 2 - pos.y - pos.z * 0.5
    };
  }

  function drawResultPage() {
    drawParallaxGrid();
    drawBackgroundRipples();

    ctx.save();
    ctx.translate(-width / 6, -height / 10);
    const styleImg = styleImages[sittingStyleResult.styleIndex];
    if (styleImg && styleImg.complete) {
      const imgWidth = Math.min(width / 2.4, 420);
      const imgHeight = (imgWidth / styleImg.width) * styleImg.height;
      drawCenteredImage(styleImg, 0, 0, imgWidth, imgHeight);
    }
    ctx.restore();

    modelRotation += 0.01;
  }

  function clearResultChair() {
    if (!resultChairRoot) return;
    while (resultChairRoot.children.length) {
      resultChairRoot.remove(resultChairRoot.children[0]);
    }
    resultChairBuilt = false;
  }

  function buildResultChair() {
    clearResultChair();
    getSelectedIds().forEach((id) => {
      const part = clonePart(id);
      if (part) resultChairRoot.add(part);
    });
    resultChairRoot.scale.set(chairScale, chairScale, chairScale);
    resultChairBuilt = true;
  }

  function updateResult3DScene() {
    if (!resultChairBuilt) return;
    resultChairRoot.position.set(width / 6, 20, 0);
    resultChairRoot.rotation.set(chairTilt, modelRotation, 0);
  }

  function goToResult() {
    if (currentSelections < minSelections) return;
    sittingStyleResult = calculateSittingStyle();
    buildResultChair();
    isPanelOpen = false;
    panelTargetPosition = 0;
    panelPosition = 0;
    loadingStartTime = Date.now();
    currentPage = 'loading';
    refreshHud();
  }

  function goBackToMain() {
    currentPage = 'main';
    sittingStyleResult = null;
    clearResultChair();
    isPanelOpen = false;
    panelPosition = 0;
    panelTargetPosition = 0;
    refreshHud();
  }

  function downloadDesign() {
    if (!sittingStyleResult) return;
    const style = SITTING_STYLES[sittingStyleResult.styleIndex];

    renderer.render(scene, camera);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = uiCanvas.width;
    exportCanvas.height = uiCanvas.height;
    const xctx = exportCanvas.getContext('2d');

    xctx.fillStyle = 'rgb(155, 155, 155)';
    xctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    xctx.drawImage(webglCanvas, 0, 0);
    xctx.drawImage(uiCanvas, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    xctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    xctx.fillStyle = '#111111';
    xctx.font = '22px Kollektif-Bold, sans-serif';
    xctx.textAlign = 'left';
    xctx.fillText('CHAIR DE OLOGY', 40, 48);
    xctx.fillStyle = '#ffffff';
    xctx.font = '16px Kollektif-Bold, sans-serif';
    xctx.fillText(style.name + '  ·  ' + sittingStyleResult.personalityCode, 40, height - 40);
    xctx.font = '13px Kollektif-Bold, sans-serif';
    wrapFillText(xctx, style.tagline, 40, height - 64, 420, 18);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chair-de-ology-${style.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  function wrapFillText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let drawY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (context.measureText(testLine).width > maxWidth && n > 0) {
        context.fillText(line, x, drawY);
        line = words[n] + ' ';
        drawY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, drawY);
  }

  function calculateSittingStyle() {
    let imaginativeScore = 0;
    let moralYesCount = 0;
    for (let i = 0; i < selectedOptions.length; i++) {
      if (!selectedOptions[i]) continue;
      imaginativeScore += OPTIONS[i].imaginative;
      if (OPTIONS[i].moral === 'yes') moralYesCount++;
    }

    const imaginativeFactor = imaginativeScore > 6 ? 'N' : 'S';
    const moralFactor = moralYesCount >= 4 ? 'F' : 'T';

    const explore = behavior.focusedIds.size;
    const details = behavior.seenDetails.size;
    const changes = behavior.groupResets;
    const leftover = maxSelections - currentSelections;
    const dwellSec = Math.min((Date.now() - behavior.sessionStart) / 1000, 180);
    const perceivingScore =
      explore * 0.35 +
      details * 1.15 +
      changes * 2.4 +
      leftover * 2 +
      (dwellSec > 50 ? 2 : 0);
    const decisionFactor = perceivingScore >= 8 ? 'P' : 'J';

    let styleIndex;
    if (imaginativeFactor === 'N') {
      if (moralFactor === 'T') {
        styleIndex = decisionFactor === 'P' ? 0 : 1;
      } else {
        styleIndex = decisionFactor === 'P' ? 2 : 3;
      }
    } else if (moralFactor === 'T') {
      styleIndex = decisionFactor === 'P' ? 6 : 4;
    } else {
      styleIndex = decisionFactor === 'P' ? 7 : 5;
    }

    return {
      styleIndex,
      personalityCode: imaginativeFactor + moralFactor + decisionFactor
    };
  }

  function eventOnHud(target) {
    return !!(target && target.closest && target.closest('button, .intro, .result-actions, .present-wrap'));
  }

  function closePanel() {
    panelTargetPosition = 0;
    isPanelOpen = false;
  }

  function optionIdFromRoot(root) {
    if (!root || !raycaster) return null;
    root.updateMatrixWorld(true);
    raycaster.setFromCamera(new THREE.Vector2(
      (mouseX / width) * 2 - 1,
      -(mouseY / height) * 2 + 1
    ), camera);
    const hits = raycaster.intersectObject(root, true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj && obj.userData.optionId == null) obj = obj.parent;
    return obj ? obj.userData.optionId : null;
  }

  function bindEvents() {
    window.addEventListener('resize', resize);

    hud.begin.addEventListener('click', () => {
      introOpen = false;
      behavior.sessionStart = Date.now();
      refreshHud();
    });

    hud.reset.addEventListener('click', () => {
      resetAllSelections();
    });

    hud.present.addEventListener('click', () => {
      goToResult();
    });

    hud.tray.addEventListener('click', () => {
      isPanelOpen = !isPanelOpen;
      panelTargetPosition = isPanelOpen ? 1 : 0;
    });

    hud.back.addEventListener('click', goBackToMain);
    hud.download.addEventListener('click', downloadDesign);

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (rippleHistory.length < maxRipples) {
        rippleHistory.push({ x: mouseX, y: mouseY, radius: 0, alpha: 200 });
      }

      if (orbitControlEnabled && currentPage === 'main') {
        const deltaX = (mouseX - prevMouseX) * 0.01;
        const deltaY = (mouseY - prevMouseY) * 0.01;
        centerOrbitX += deltaX;
        centerOrbitY = constrain(centerOrbitY - deltaY, Math.PI / 12, Math.PI / 2);
        prevMouseX = mouseX;
        prevMouseY = mouseY;
      }
    });

    window.addEventListener('pointerdown', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      pointerStart = null;
      if (introOpen || currentPage !== 'main') return;
      if (eventOnHud(e.target)) return;

      const relMouseX = mouseX - width / 2;
      const relMouseY = mouseY - height / 2;

      if (isPanelOpen) {
        const panelLeft = width / 2 - panelWidth * panelPosition;
        const closeBtnX = panelLeft + panelWidth - 30;
        const closeBtnY = -height / 2 + 35;

        if (dist(relMouseX, relMouseY, closeBtnX, closeBtnY) < 20) {
          closePanel();
          return;
        }

        if (relMouseX >= panelLeft && relMouseX <= width / 2) {
          pointerStart = { x: mouseX, y: mouseY, mode: 'panel' };
          return;
        }
        closePanel();
      }

      if (isMouseOverModel || isMouseOverCenter) {
        orbitControlEnabled = true;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        pointerStart = { x: mouseX, y: mouseY, mode: 'chair' };
        return;
      }

      for (const option of options) {
        if (option.isAtPointM() || dist(relMouseX, relMouseY, option.x, option.y) < option.size / 2) {
          handleOptionSelection(option);
          return;
        }
      }

      ringDrag = { y: e.clientY, pointerId: e.pointerId };
    });

    window.addEventListener('pointermove', (e) => {
      if (!ringDrag || orbitControlEnabled) return;
      const dy = e.clientY - ringDrag.y;
      angleOffset += dy * 0.004;
      ringDrag.y = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      if (pointerStart && dist(mouseX, mouseY, pointerStart.x, pointerStart.y) < 8) {
        const root = pointerStart.mode === 'panel' ? panelChairRoot : assemblyRoot;
        const id = optionIdFromRoot(root);
        if (id != null && selectedOptions[id]) resetOptionGroup(Math.floor(id / 3));
      }
      pointerStart = null;
      orbitControlEnabled = false;
      ringDrag = null;
    });

    window.addEventListener('wheel', (e) => {
      if (introOpen || currentPage !== 'main') return;
      angleOffset += e.deltaY * 0.001;
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePanel();
      if (e.key === 'Enter' && currentPage === 'main' && currentSelections >= minSelections) {
        goToResult();
      }

      if (!debugMode || enlargedOption === null) return;
      const spec = OPTIONS[enlargedOption.id];
      const moveStep = e.shiftKey ? 2.5 : 5;
      if (e.key === 'ArrowLeft') spec.offset.x -= moveStep;
      if (e.key === 'ArrowRight') spec.offset.x += moveStep;
      if (e.key === 'ArrowUp') spec.offset.y -= moveStep;
      if (e.key === 'ArrowDown') spec.offset.y += moveStep;
      if (e.key === 'w' || e.key === 'W') spec.offset.z -= moveStep;
      if (e.key === 's' || e.key === 'S') spec.offset.z += moveStep;
      if (e.key === 'r' || e.key === 'R') spec.offset = { x: 0, y: 0, z: 0 };
      const scaleStep = e.shiftKey ? 0.05 : 0.1;
      if (e.key === '+' || e.key === '=') spec.scale += scaleStep;
      if (e.key === '-' || e.key === '_') spec.scale -= scaleStep;
      if (e.key === '0') spec.scale = 1;
      spec.scale = Math.max(0.1, spec.scale);
      console.log(`Option ${enlargedOption.id + 1}`, spec.offset, spec.scale);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
