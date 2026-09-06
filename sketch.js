// Configuration
let numOptions = 21;
let options = [];
let centerX, centerY, radius;
let angleOffset = 0;
let pointM;
let optionImages = [];
let centerImage;
let models = [];
let modelRotation = 0;
let enlargedOption = null;
let myFont;
let isCounterHovered = false;
let isPanelOpen = false;
let panelPosition = 0; // 0 = closed, 1 = fully open
let panelWidth = 400;
let panelEasing = 0.05;
let panelTargetPosition = 0;
let panelClickBlockTimer = 0; // Prevents accidental immediate closing
let resetButton;
let resetButtonImage;
let resetButtonX, resetButtonY;
let resetButtonWidth = 160;
let resetButtonHeight = 60;

// Personality Factor system
let optionImaginativeValues = [
  0, 0, 2,  // First group (options 0-2)
  0, 1, 1,  // Second group (options 3-5)
  0, 0, 0,  // Third group (options 6-8)
  0, 1, 1,  // Fourth group (options 9-11)
  0, 1, 2,  // Fifth group (options 12-14)
  1, 2, 2,  // Sixth group (options 15-17)
  1, 2, 2   // Seventh group (options 18-20)
];
let optionMoralValues = [
  "yes", "yes", "no",  // First group (options 0-2)
  "yes", "no", "no",  // Second group (options 3-5)
  "no", "yes", "yes",  // Third group (options 6-8)
  "no", "no", "no",  // Fourth group (options 9-11)
  "yes", "yes", "yes",  // Fifth group (options 12-14)
  "no", "no", "yes",  // Sixth group (options 15-17)
  "yes", "no", "no"   // Seventh group (options 18-20)
];
let totalScrollAmount = 0;
let styleImages = [];

// Selection system
let maxSelections = 7;
let currentSelections = 0;
let selectedOptions = Array(21).fill(false);
let optionGroups = [];

// Add these variables to your existing configuration section
let presentButton;
let presentButtonImage;
let isButtonActive = false;
let minSelections = 5;
let currentPage = "main"; // States: "main", "loading", "result"
let loadingStartTime;
let loadingDuration = 3000; // 3 seconds loading time
let presentButtonX, presentButtonY;
let presentButtonWidth = 280;
let presentButtonHeight = 110;

// Background effects
let rippleHistory = [];
let maxRipples = 10;
let rippleFadeSpeed = 0.01;
let gridSpacing = 60;
let gridOffset = { x: 0, y: 0 };

// Dot interaction
let dots = [];
let dotRadius = 10;
let boundaryRadius;
let detailImages = [];
let hoveredDot = null;
let currentDetailImage = null;

let dotPulseSpeed = 0.1;
let dotMinScale = 0.8;
let dotMaxScale = 1.7;

// 3D Model variables
let centerModel;
let modelOffsets = [
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
let offsetStep = 5;

let modelScales = [
  1,    // Option 0
  1,  // Option 1
  1,  // Option 2
  1,  // Option 3
  1.3,  // Option 4
  1.6,    // Option 5
  1,  // Option 6
  1,  // Option 7
  1,    // Option 8
  1.2,  // Option 9
  1.3,  // Option 10
  1.1,    // Option 11
  0.8,  // Option 12
  1,  // Option 13
  1,    // Option 14
  2,  // Option 15
  1.7,  // Option 16
  0.5,    // Option 17
  1,  // Option 18
  0.5,  // Option 19
  2.5   // Option 20
];

// Orbit control
let orbitControlEnabled = false;
let orbitX = 0;
let orbitY;
let prevMouseX, prevMouseY;
let isMouseOverModel = false;
let centerOrbitX = 0;
let centerOrbitY;
let isMouseOverCenter = false;

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
    this.x = centerX + radius * cos(this.angle + angleOffset);
    this.y = centerY + radius * sin(this.angle + angleOffset);
    this.size = this.isAtPointM() ? this.baseSize * 2 : this.baseSize;

    if (this.x < 0) {
      this.opacity = 0;
    } else {
      let fadeRange = height * 0.3;
      let halfHeight = height / 2;
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
  if (this.opacity > 0) {
    push();
    translate(this.x, this.y);
    
    if (!this.isActive) {
      tint(255, 50);
      imageMode(CENTER);
      image(this.img, 0, 0, this.size, this.size);
    } else if (this.isSelected) {
      // Draw the main image
      tint(255, this.opacity);
      imageMode(CENTER);
      image(this.img, 0, 0, this.size, this.size);
      
      // Add inner glow effect
      push();
      imageMode(CENTER);
      blendMode(ADD);
      tint(255, 70);
      image(this.img, 0, 0, this.size * 0.9, this.size * 0.9);
      pop();
      
      // Add pulsing outline
      noFill();
      strokeWeight(6);
      stroke(255, this.opacity * 0.8);
      // Adjust these values to control the pulse
      let pulseSpeed = 0.06;      // Lower = slower, Higher = faster
      let pulseMinSize = 0.8;    // Minimum size multiplier (1.0 = same as original)
      let pulseMaxSize = 1;   // Maximum size multiplier

      // Calculate the pulse size with the new parameters
      let pulseSize = this.size * (pulseMinSize + 
                      (pulseMaxSize - pulseMinSize) * 
                      sin(frameCount * pulseSpeed));
      ellipse(0, 0, pulseSize, pulseSize);
    } else {
      // Regular unselected item
      tint(255, this.opacity);
      imageMode(CENTER);
      image(this.img, 0, 0, this.size, this.size);
    }
    
    noTint();
    pop();
  }
}

  isAtPointM() {
    if (!this.isActive) return false;
    return dist(this.x, this.y, pointM.x, pointM.y) < 20;
  }
}

function preload() {
  let timestamp = Date.now();
  
  for (let i = 1; i <= numOptions; i++) {
    optionImages.push(loadImage(`Thumbnails/opt${i}.png?t=${timestamp}`));
    models.push(loadModel(`Assets/OBJ/Option${i}_P.obj`, true));
    
    detailImages[i-1] = [
      loadImage(`Assets/Details/detailA_${i}.png?t=${timestamp}`),
      loadImage(`Assets/Details/detailB_${i}.png?t=${timestamp}`),
      loadImage(`Assets/Details/detailC_${i}.png?t=${timestamp}`)
    ];
  }
  myFont = loadFont('Fonts/Kollektif-Bold.ttf');
  
  centerImage = loadImage(`Assets/White ring.png?t=${timestamp}`);
  centerModel = loadModel('Assets/Background/Default_Chair.obj', true);
  
  // Load the present button image
  presentButtonImage = loadImage(`Assets/Present.png?t=${timestamp}`);
  
  // Load sitting style images
  for (let i = 1; i <= 8; i++) {
    styleImages.push(loadImage(`Assets/Style/Style_${i}.png?t=${timestamp}`));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  ortho(-width / 2, width / 2, -height / 2, height / 2, -1000, 1000);
  
  // Initialize option groups (7 groups of 3)
  for (let i = 0; i < 7; i++) {
    optionGroups.push([i*3, i*3+1, i*3+2]);
  }
  
  textFont(myFont);
  textSize(20);
  
  centerX = 0;
  centerY = 0;
  radius = 400;
  pointM = createVector(centerX + radius, centerY);
  boundaryRadius = min(width, height) * 0.2;
  orbitY = -PI/6;
  centerOrbitY = -PI/6;

  for (let i = 0; i < numOptions; i++) {
    let angle = map(i, 0, numOptions, 0, TWO_PI * 1);
    options.push(new Option(angle, optionImages[i], i));
  }
}

function draw() {
  if (currentPage === "main") {
    drawMainPage();
  } else if (currentPage === "loading") {
    drawLoadingPage();
  } else if (currentPage === "result") {
    drawResultPage();
  }
}

function drawMainPage() {
  background(155);
  
  drawParallaxGrid();
  drawBackgroundRipples();
  drawCenterImage();
  enlargedOption = null;
  drawTitle();
  drawResetButton();
  
  for (let option of options) {
    option.update();
    if (option.x > 0) {
      option.display();
      if (option.isAtPointM()) {
        enlargedOption = option;
      }
    }
  }

  checkModelHover();
  
  display3DModel();
  drawBoundary();
  displayCenterModel();
  
  modelRotation += 0.01;

  if (enlargedOption !== null) {
    if (dots.length === 0) createDots();
    drawDots();
    displayDetailImage();
  } else {
    dots = [];
    currentDetailImage = null;
  }
  
  // Selection counter
  push();
  fill(255);
  noStroke();
  textSize(16);
  textAlign(RIGHT, TOP);
  text(`Selections: ${currentSelections}/${maxSelections}`, width - 20, 20);
  pop();
  
  drawPresentButton();
  drawSelectionCounter();
}

function drawPresentButton() {
  // Update button active state
  isButtonActive = currentSelections >= minSelections;
  
  // Left middle of screen - store these globally so mousePressed can use them
  presentButtonX = -width/2 + 260;
  presentButtonY = 0;
  
  push();
  translate(0, 0, 100);
  imageMode(CENTER);
  
  // Apply visual feedback for active/inactive state
  if (isButtonActive) {
    // Button is active - normal opacity
    image(presentButtonImage, presentButtonX, presentButtonY, presentButtonWidth, presentButtonHeight);
    
    // Add subtle animation when active
    let pulseWidth = presentButtonWidth * (1 + 0.03 * sin(frameCount * 0.05));
    let pulseHeight = presentButtonHeight * (1 + 0.03 * sin(frameCount * 0.05));
    noFill();
    stroke(255, 100);
    ellipse(presentButtonX, presentButtonY, pulseWidth, pulseHeight);
  } else {
    // Button is inactive - reduced opacity
    tint(255, 100);
    image(presentButtonImage, presentButtonX, presentButtonY, presentButtonWidth, presentButtonHeight);
    noTint();
  }
  
  pop();
}

function drawLoadingPage() {
  background(100);
  
  // Calculate loading progress
  let elapsed = millis() - loadingStartTime;
  let progress = constrain(elapsed / loadingDuration, 0, 1);
  
  // Draw loading animation
  push();
  translate(0, 0, 0);
  
  // Loading text
  fill(255);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Preparing your result...", 0, -50);
  
  // Loading bar
  let barWidth = 400;
  noFill();
  stroke(255);
  rect(-barWidth/2, 0, barWidth, 20);
  
  fill(255);
  noStroke();
  rect(-barWidth/2, 0, barWidth * progress, 20);
  
  pop();
  
  // Check if loading is complete
  if (progress >= 1) {
    currentPage = "result";
  }
}

function drawResultPage() {
  background(180);
  
    drawParallaxGrid();
    drawBackgroundRipples();
  
  // Calculate sitting style (only once)
  if (!this.sittingStyleResult) {
    this.sittingStyleResult = calculateSittingStyle();
  }
  
  push();
  
  // Split the screen into two sections
  // Left side - Sitting style
  push();
  translate(-width/6, 0, 0);
  
  // Display sitting style image
  imageMode(CENTER);
  let styleImg = styleImages[this.sittingStyleResult.styleIndex];
  let imgWidth = min(width/2 - 40, styleImg.width);
  let imgHeight = (imgWidth / styleImg.width) * styleImg.height;
  image(styleImg, 0, 0, imgWidth, imgHeight);
  
  // Style title and description
  textAlign(LEFT, TOP);
  fill(255);
  textSize(60);
  text("YOUR SITTING STYLE IS", 0, -height/2.5);
  
  pop();
  
  // Right side - 3D Model result (existing functionality)
  push();
  translate(width/6, 0, 0);
  
  // Display selected options
  let selectedIds = [];
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i]) selectedIds.push(i);
  }
  
  // Display result image or 3D model based on selections
  displayResultModel(selectedIds);
  
  pop();
  
  drawDownloadButton();
  // Back button
  drawBackButton();
  
  pop();
}

function displayResultModel(selectedIds) {
  push();
  directionalLight(150, 150, 150, 0, -1, -1);
  directionalLight(150, 150, 150, 1, 1, -1);
  ambientLight(120);
  
  translate(0, 0, 200);
  rotateX(-PI/6);
  rotateY(modelRotation);
  
  noStroke();
  ambientMaterial(320);
  specularMaterial(50);
  scale(1, 1, 1);
  
  // Display all selected models
  for (let id of selectedIds) {
    let offset = modelOffsets[id];
    let modelScale = modelScales[id];
    
    push();
    translate(offset.x, offset.y, offset.z);
    scale(modelScale, -modelScale, modelScale);
    model(models[id]);
    pop();
  }
  
  pop();
  
  // Continue rotation
  modelRotation += 0.01;
}

function drawBackButton() {
  let backButtonX = 0;
  let backButtonY = height/3 - 30;
  
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("Back", backButtonX, backButtonY);
  pop();
}

function downloadModel() {
  // Get the selected option IDs
  let selectedIds = [];
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i]) selectedIds.push(i);
  }
  
  // Create model data (this is just an example - customize for your needs)
  let modelData = {
    title: "My Custom Chair Design",
    date: new Date().toISOString(),
    selectedParts: selectedIds,
    offsets: selectedIds.map(id => modelOffsets[id]),
    scales: selectedIds.map(id => modelScales[id])
  };
  
  // Convert to JSON string
  let jsonData = JSON.stringify(modelData, null, 2);
  
  // Create a blob and download link
  let blob = new Blob([jsonData], {type: 'application/json'});
  let url = URL.createObjectURL(blob);
  
  // Create temporary link and trigger download
  let a = document.createElement('a');
  a.href = url;
  a.download = 'chair_design.json';
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function drawDownloadButton() {
  let downloadButtonX = width/2 - 100; // 100px from right edge
  let downloadButtonY = height/2 - 50;  // 50px from bottom edge
  
  fill(0);
  textSize(20);
  textAlign(RIGHT, BOTTOM);
  text("Download Design", downloadButtonX, downloadButtonY);
  pop();
}

function handleOptionSelection(selectedOption) {
  let group = optionGroups[selectedOption.groupIndex];
  
  // Clicking selected option resets group
  if (selectedOption.isSelected) {
    resetOptionGroup(selectedOption.groupIndex);
    return;
  }
  
  // Check max selections
  if (currentSelections >= maxSelections) {
    console.log("Maximum selections reached");
    return;
  }
  
  // Select this option
  selectedOption.isSelected = true;
  selectedOptions[selectedOption.id] = true;
  currentSelections++;
  
  // Deactivate other options in group
  for (let optionId of group) {
    if (optionId !== selectedOption.id) {
      options[optionId].isActive = false;
    }
  }
  
  console.log("Selected option:", selectedOption.id + 1);
  printSelectedOptions();
}

function resetOptionGroup(groupIndex) {
  let group = optionGroups[groupIndex];
  
  // Decrement count if this group had a selection
  if (options[group[0]].isSelected || options[group[1]].isSelected || options[group[2]].isSelected) {
    currentSelections--;
  }
  
  // Reset all options in group
  for (let optionId of group) {
    options[optionId].isSelected = false;
    options[optionId].isActive = true;
    selectedOptions[optionId] = false;
  }
  
  console.log("Reset group:", groupIndex + 1);
  printSelectedOptions();
}

function printSelectedOptions() {
  let selected = [];
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i]) selected.push(i + 1);
  }
  console.log("Current selections:", selected.join(", "));
}

function drawTitle() {
  push();
  translate(-width/2 + 50, -height/2 + 60, 100); // Position at top left with some padding
    // Draw main title text with different colors
  textAlign(LEFT, TOP);
  textSize(70); // Larger text size for the main title
  
  // Draw "CHAIR" in white
  fill(255); // White color
  text("CHAIR", 0, 0);
  
  // Calculate the width of "CHAIR" to correctly position "DE OLOGY"
  let chairWidth = textWidth("CHAIR");
  
  // Draw "DE OLOGY" in black
  fill(0); // Black color
  text("DE OLOGY", chairWidth, 0);
  
  // Draw subtitle "design how you sit"
  textSize(25); // Smaller text size for the subtitle
  text("DESIGN HOW YOU SIT", 5, 90);
  
  pop();
}

function mousePressed() {
  let relativeMouseX = mouseX - width/2;
  let relativeMouseY = mouseY - height/2;
  
  if (currentPage === "main") {
    if (isMouseOverResetButton()) {
      resetAllSelections();
      return false;
    }
    // Check if panel is already open and if click is within panel area
    if (isPanelOpen) {
      let panelX = width/2 - panelWidth * (1 - panelPosition);
      
      // If click is within panel area, handle panel interactions
      if (relativeMouseX > panelX && relativeMouseX < width/2) {
        // Check if close button was clicked
        let closeButtonX = panelX + panelWidth - 30;
        let closeButtonY = -height/2 + 30;
        
        if (dist(relativeMouseX, relativeMouseY, closeButtonX, closeButtonY) < 15) {
          panelTargetPosition = 0;
          isPanelOpen = false;
          panelClickBlockTimer = 10; // Add click block time
          return false;
        }
        
        // Click was inside panel but not on close button, do nothing
        return false;
      }
    }
    
    // Check if counter was clicked (but not during click block time)
    let counterX = width/2 - 80;
    let counterY = height/2 - 60;
    
    if (isCounterHovered && panelClickBlockTimer === 0) {
      // Toggle panel
      panelTargetPosition = isPanelOpen ? 0 : 1;
      isPanelOpen = !isPanelOpen;
      panelClickBlockTimer = 10; // Add click block time
      return false;
    }
    
    // Existing code for button interactions...
    if (isButtonActive && 
        relativeMouseX > presentButtonX - presentButtonWidth/2 && 
        relativeMouseX < presentButtonX + presentButtonWidth/2 &&
        relativeMouseY > presentButtonY - presentButtonHeight/2 && 
        relativeMouseY < presentButtonY + presentButtonHeight/2) {
      // Present button was clicked and is active
      currentPage = "loading";
      loadingStartTime = millis();
      return false;
    }
    
    // Handle existing interaction from your code
    if (isMouseOverModel || isMouseOverCenter) {
      orbitControlEnabled = true;
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      return false;
    }
    
    for (let option of options) {
      if (option.isAtPointM() && option.isActive) {
        handleOptionSelection(option);
        break;
      }
    }
  } 
  else if (currentPage === "result") {
    // Check if back button was clicked (with updated position)
    let backButtonX = 0; // We moved the button to center
    let backButtonY = height/3 - 30;
    
    if (relativeMouseX > backButtonX - 50 && relativeMouseX < backButtonX + 50 &&
        relativeMouseY > backButtonY - 15 && relativeMouseY < backButtonY + 15) {
      console.log("Back button clicked!");
      currentPage = "main";
      // Reset the sitting style result for next test
      sittingStyleResult = null;
      // Reset scroll amount for next test
      totalScrollAmount = 0;
      // Reset panel state
      isPanelOpen = false;
      panelPosition = 0;
      panelTargetPosition = 0;
      return false;
    }
    let downloadButtonX = width/2 - 100;
    let downloadButtonY = height/2 - 50;
    let downloadButtonWidth = 150;  // Approximate width of "Download Design" text
    let downloadButtonHeight = 30;  // Approximate height of text
    
    if (relativeMouseX > downloadButtonX - downloadButtonWidth && relativeMouseX < downloadButtonX &&
        relativeMouseY > downloadButtonY - downloadButtonHeight && relativeMouseY < downloadButtonY) {
      console.log("Download button clicked!");
      downloadModel();
      return false;
    }
  }
}

function drawResetButton() {
  // Position in the top right corner
  resetButtonX = width/2 - 100;
  resetButtonY = -height/2 + 60;
  
  push();
  translate(0, 0, 100);
  
  // Button background
  if (isMouseOverResetButton()) {
    // Hover state
    fill(255, 0, 0, 200);
  } else {
    // Normal state
    fill(180, 0, 0, 150);
  }
  
  // Button text
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(24);
  text("RESET", resetButtonX, resetButtonY);
  
  pop();
}

function isMouseOverResetButton() {
  let relativeMouseX = mouseX - width/2;
  let relativeMouseY = mouseY - height/2;
  
  return (
    relativeMouseX > resetButtonX - resetButtonWidth/2 &&
    relativeMouseX < resetButtonX + resetButtonWidth/2 &&
    relativeMouseY > resetButtonY - resetButtonHeight/2 &&
    relativeMouseY < resetButtonY + resetButtonHeight/2
  );
}

function resetAllSelections() {
  // Reset all option groups
  for (let groupIndex = 0; groupIndex < optionGroups.length; groupIndex++) {
    resetOptionGroup(groupIndex);
  }
  
  // This will ensure the counter is properly reset
  currentSelections = 0;
  
  // Reset all option states to default
  for (let i = 0; i < options.length; i++) {
    options[i].isSelected = false;
    options[i].isActive = true;
    selectedOptions[i] = false;
  }
  
  console.log("All selections reset");
}

function mouseMoved() {
  if (rippleHistory.length < maxRipples) {
    rippleHistory.push({
      x: mouseX,
      y: mouseY,
      radius: 0,
      alpha: 200
    });
  }
    if (rippleHistory.length < maxRipples) {
    rippleHistory.push({
      x: mouseX,
      y: mouseY,
      radius: 0,
      alpha: 200
    });
  }
}

function drawSelectionCounter() {
  let counterX = width/2 - 80;
  let counterY = height/2 - 60;
  let counterSize = 100;
  
  // Check if mouse is hovering over counter
  let mouseRelX = mouseX - width/2;
  let mouseRelY = mouseY - height/2;
  
  isCounterHovered = dist(mouseRelX, mouseRelY, counterX, counterY) < counterSize/2;
  
  push();
  translate(0, 0, 100);
  
  // Draw counter with hover effect
  let displaySize = isCounterHovered ? counterSize * 1.2 : counterSize;
  
  // Background circle
  fill(0, 150);
  stroke(255);
  strokeWeight(2);
  ellipse(counterX, counterY, displaySize, displaySize);
  
  // Counter text
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(isCounterHovered ? 36 : 30);
  text(`${currentSelections}/${maxSelections}`, counterX, counterY);
  
  // Draw panel if open or opening
  drawSelectionPanel();
  
  pop();
  
  // Decrease click block timer if active
  if (panelClickBlockTimer > 0) {
    panelClickBlockTimer--;
  }
}

function drawSelectionPanel() {
  // Update panel position with easing
  panelPosition += (panelTargetPosition - panelPosition) * panelEasing;
  
  if (panelPosition < 0.01 && panelTargetPosition === 0) {
    panelPosition = 0;
    return; // Don't draw if fully closed
  }
  
  // Calculate panel dimensions
  let panelX = width/2 - panelWidth * (1 - panelPosition);
  let panelHeight = height;
  
  // Draw panel background
  push();
  translate(0, 0, 90);
  fill(30, 30, 10, 230);
  noStroke();
  rect(panelX, -height/2, panelWidth, panelHeight);
  
  // Panel header
  fill(255);
  textSize(28);
  textAlign(CENTER, TOP);
  text(panelX + panelWidth/2, -height/2 + 30);
  
  // Draw close button
  let closeButtonX = panelX + panelWidth - 30;
  let closeButtonY = -height/2 + 30;
  
  // Check if mouse is over close button
  let mouseRelX = mouseX - width/2;
  let mouseRelY = mouseY - height/2;
  let isCloseHovered = dist(mouseRelX, mouseRelY, closeButtonX, closeButtonY) < 15;
  
  fill(isCloseHovered ? 255 : 200);
  noStroke();
  textSize(24);
  text("×", closeButtonX, closeButtonY);
  
  // Display selected options
  displaySelectedOptionsInPanel(panelX + panelWidth/2, -height/2 + 100);
  
  pop();
}

function displaySelectedOptionsInPanel(centerX, startY) {
  let selectedCount = 0;
  let spacing = 150;
  
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i]) {
      push();
      
      fill(200);
      textAlign(CENTER, TOP);
      textSize(25);
      text("Selected Designs", centerX, startY - 20);
      // Position for this option
      let optionY = startY + selectedCount * spacing;
      
      // Draw small version of the 3D model
      translate(centerX, optionY + 70, 100);
      rotateX(PI/6);
      rotateY(frameCount * 0.01);
      
      let offset = modelOffsets[i];
      let modelScale = modelScales[i] * 0.4; // Scale down for panel display
      
      directionalLight(255, 255, 255, 0, -1, -1);
      ambientLight(150);
      noStroke();
      ambientMaterial(320);
      
      push();
      translate(offset.x * 0.15, offset.y * 0.15, offset.z * 0.15);
      scale(modelScale, -modelScale, modelScale);
      model(models[i]);
      pop();
      
      pop();
      
      selectedCount++;
    }
  }
  
  // If no options selected
  if (selectedCount === 0) {
    fill(200);
    textAlign(CENTER, TOP);
    textSize(16);
    text("No designs selected yet", centerX, startY + 50);
  }
}

function mouseDragged() {
  if (currentPage !== "main") return;
  
  if (orbitControlEnabled) {
    let deltaX = (mouseX - prevMouseX) * 0.01;
    let deltaY = (mouseY - prevMouseY) * 0.01;
    
    if (isMouseOverModel) {
      orbitX += deltaX;
      orbitY -= deltaY;
      orbitY = constrain(orbitY, -PI/2, 0);
    }
    
    if (isMouseOverCenter) {
      centerOrbitX += deltaX;
      centerOrbitY -= deltaY;
      centerOrbitY = constrain(centerOrbitY, -PI/2, 0);
    }
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    return false;
  }
}

function checkModelHover() {
  isMouseOverCenter = false;
  isMouseOverModel = false;
  
  // Check center model
  let centerPos = createVector(-70, 0, 50);
  let centerScreenPos = worldToScreen(centerPos);
  isMouseOverCenter = dist(mouseX, mouseY, centerScreenPos.x, centerScreenPos.y) < 200;
  
  // Check selected model
  if (enlargedOption !== null) {
    let modelPos = createVector(-70, 0, 50);
    let modelScreenPos = worldToScreen(modelPos);
    isMouseOverModel = dist(mouseX, mouseY, modelScreenPos.x, modelScreenPos.y) < 200;
  }
}

function worldToScreen(pos) {
  let screenX = width/2 + pos.x - pos.z * 0.5;
  let screenY = height/2 - pos.y - pos.z * 0.5;
  return createVector(screenX, screenY);
}

function drawParallaxGrid() {
  push();
  translate(0, 0, -200);
  stroke(255, 35);
  strokeWeight(1);
  noFill();

  let cols = ceil(width / gridSpacing) + 2;
  let rows = ceil(height / gridSpacing) + 2;

  gridOffset.x = sin(millis() * 0.0002) * 30 + (mouseX - width / 2) * 0.005;
  gridOffset.y = cos(millis() * 0.0002) * 30 + (mouseY - height / 2) * 0.005;

  for (let i = -cols; i < cols; i++) {
    let x = i * gridSpacing + gridOffset.x;
    line(x - width / 2, -height, x - width / 2, height);
  }

  for (let j = -rows; j < rows; j++) {
    let y = j * gridSpacing + gridOffset.y;
    line(-width, y - height / 2, width, y - height / 2);
  }
  pop();
}

function drawBackgroundRipples() {
  push();
  translate(0, 0, -150);
  noFill();
  stroke(255, 50);

  for (let i = rippleHistory.length - 1; i >= 0; i--) {
    let ripple = rippleHistory[i];
    ripple.radius += 1.5;
    ripple.alpha -= rippleFadeSpeed * 255;

    stroke(255, ripple.alpha);
    ellipse(ripple.x - width / 2, ripple.y - height / 2, ripple.radius * 2);

    if (ripple.alpha <= 0) {
      rippleHistory.splice(i, 1);
    }
  }
  pop();
}

function drawCenterImage() {
  push();
  translate(20, 0, -100);
  imageMode(CENTER);
  image(centerImage, -100, 0, 720, 680);
  pop();
}

function drawBoundary() {
  push();
  translate(30, -30, -50);
  noFill();

  pop();
}

function createDots() {
  dots = [];
  let attempts = 0;
  const minDist = dotRadius * 12;
  const maxAttempts = 100;

  while (dots.length < 3 && attempts < maxAttempts) {
    let angle = random(TWO_PI);
    let distance = random(boundaryRadius * 0.2, boundaryRadius * 0.8);
    let x = distance * cos(angle);
    let y = distance * sin(angle);

    let valid = true;
    for (let other of dots) {
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

  if (dots.length < 3) {
    console.warn("Could not place all dots with enough spacing.");
  }
}

function drawDots() {
  hoveredDot = null;
  push();
  translate(0, 0, 300);
  
  let boundaryMouseX = mouseX - width/2 + 100;
  let boundaryMouseY = mouseY - height/2;
  
  for (let dot of dots) {
    // Check if mouse is hovering over this dot
    dot.hovered = dist(boundaryMouseX, boundaryMouseY, dot.x, dot.y) < dotRadius;
    if (dot.hovered) hoveredDot = dot;
    
    // Calculate pulsing size based on scaling the base size
    let pulseScale = map(sin(frameCount * dotPulseSpeed + dot.id * 0.5), -1, 1, 
                         dotMinScale, dotMaxScale);
    
    // Apply different scaling if hovered
    let finalRadius = dot.hovered ? dotRadius * 1.5 * pulseScale : dotRadius * pulseScale;
    
    // Calculate opacity - add fade effect when enlarged
    let baseOpacity = 255;
    let opacity = baseOpacity;
    
    if (dot.hovered) {
      // Create a "breathing" opacity effect for hovered dots
      opacity = map(sin(frameCount * dotPulseSpeed * 2 + dot.id), -1, 1, 100, 255);
    } else {
      // For non-hovered dots, make opacity correspond to size
      opacity = map(pulseScale, dotMinScale, dotMaxScale, 200, 255);
    }
    
    fill(255, opacity);
    noStroke();
    ellipse(-100 + dot.x, dot.y, finalRadius * 2);
  }
  pop();
}

function displayDetailImage() {
  if (hoveredDot && enlargedOption) {
    let detailImg = detailImages[enlargedOption.id][hoveredDot.id];
    if (detailImg) {
      push();
      translate(0, 0, 450);
      imageMode(CENTER);
      image(detailImg, -100 + hoveredDot.x, hoveredDot.y, 400, 400);
      pop();
    }
  }
}

function display3DModel() {
  if (enlargedOption !== null) {
    push();
    directionalLight(200, 200, 200, 0, -1, -1);
    directionalLight(150, 150, 150, 1, 1, -1);
    ambientLight(120);
    
    let offset = modelOffsets[enlargedOption.id];
    translate(-70, 0, 50);
    
    if (orbitControlEnabled && isMouseOverModel) {
      rotateX(orbitY);
      rotateY(orbitX);
    } else {
      rotateX(-PI/6);
      rotateY(modelRotation);
    }
    
    translate(offset.x, offset.y, offset.z);
    noStroke();
    ambientMaterial(250);
    specularMaterial(40);
    scale(1, -1, 1);
    
        // Apply the pre-configured scale for this model
    let modelScale = modelScales[enlargedOption.id];
    scale(modelScale, modelScale, modelScale);
    
    model(models[enlargedOption.id]);
    pop();
  }
}

function displayCenterModel() {
  if (centerModel) {
    push();
    ambientLight(200);
    
    translate(-70, 0, 50);
    
    if (orbitControlEnabled && isMouseOverCenter) {
      rotateX(centerOrbitY);
      rotateY(centerOrbitX);
    } else {
      rotateX(-PI/6);
      rotateY(modelRotation);
    }
    
    noStroke();
    scale(1.8, -1.8, 1.8);
    noFill(); // Crucial for wireframe look
    stroke(255, 70); // White with 60% opacity
    strokeWeight(0.5); // Adjust thickness as needed
    model(centerModel);
    pop();
  }
}

// Calculate sitting style based on selected options and scroll amount
function calculateSittingStyle() {
  // Calculate Imaginative factor "N"
  let imaginativeScore = 0;
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i]) {
      imaginativeScore += optionImaginativeValues[i];
    }
  }
  let imaginativeFactor = imaginativeScore > 6 ? "N" : "S";
  
  // Calculate Moral factor "F"
  let moralYesCount = 0;
  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i] && optionMoralValues[i] === "yes") {
      moralYesCount++;
    }
  }
  let moralFactor = moralYesCount >= 4 ? "F" : "T";
  
  // Calculate Decision factor "P"
  let decisionFactor = totalScrollAmount > 8000 ? "P" : "J";
  
  // Determine final style
  let styleIndex;
  if (imaginativeFactor === "N") {
    if (moralFactor === "T") {
      styleIndex = decisionFactor === "P" ? 0 : 1; // Style_1 or Style_2
    } else { // F
      styleIndex = decisionFactor === "P" ? 2 : 3; // Style_3 or Style_4
    }
  } else { // S
    if (moralFactor === "T") {
      styleIndex = decisionFactor === "P" ? 6 : 4; // Style_7 or Style_5
    } else { // F
      styleIndex = decisionFactor === "P" ? 7 : 5; // Style_8 or Style_6
    }
  }
  
  console.log("Personality Factors:", imaginativeFactor, moralFactor, decisionFactor);
  console.log("Style Index:", styleIndex + 1);
  
  return {
    styleIndex: styleIndex,
    personalityCode: imaginativeFactor + moralFactor + decisionFactor
  };
}

function mouseMoved() {
  if (rippleHistory.length < maxRipples) {
    rippleHistory.push({
      x: mouseX,
      y: mouseY,
      radius: 0,
      alpha: 200
    });
  }
}

function mouseDragged() {
  if (orbitControlEnabled) {
    let deltaX = (mouseX - prevMouseX) * 0.01;
    let deltaY = (mouseY - prevMouseY) * 0.01;
    
    if (isMouseOverModel) {
      orbitX += deltaX;
      orbitY -= deltaY;
      orbitY = constrain(orbitY, -PI/2, 0);
    }
    
    if (isMouseOverCenter) {
      centerOrbitX += deltaX;
      centerOrbitY -= deltaY;
      centerOrbitY = constrain(centerOrbitY, -PI/2, 0);
    }
    
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    return false;
  }
}

function mouseReleased() {
  orbitControlEnabled = false;
}

function mouseWheel(event) {
  if (currentPage !== "main") return;
  angleOffset += event.delta * 0.001;
  
  totalScrollAmount += event.delta;

  // Optional: log it to see it working (remove later)
  console.log("Scroll total:", totalScrollAmount);
}

function keyPressed() {
  if (enlargedOption !== null) {
    let id = enlargedOption.id;
    let offset = modelOffsets[id];
    let moveStep = keyIsDown(SHIFT) ? offsetStep/2 : offsetStep;

    if (keyCode === LEFT_ARROW) offset.x -= moveStep;
    if (keyCode === RIGHT_ARROW) offset.x += moveStep;
    if (keyCode === UP_ARROW) offset.y -= moveStep;
    if (keyCode === DOWN_ARROW) offset.y += moveStep;
    if (key === 'w' || key === 'W') offset.z -= moveStep;
    if (key === 's' || key === 'S') offset.z += moveStep;
    if (key === 'r') modelOffsets[id] = {x:0, y:0, z:0};

    // Scale adjustments 
    let scaleStep = keyIsDown(SHIFT) ? 0.05 : 0.1;
    if (key === '+' || key === '=') modelScales[id] += scaleStep;
    if (key === '-' || key === '_') modelScales[id] -= scaleStep;
    if (key === '0') modelScales[id] = 1; // Reset scale
    
    // Ensure scale doesn't go below a minimum value
    modelScales[id] = max(0.1, modelScales[id]);
    
    console.log(`Model ${id} offset:`, offset, `scale:`, modelScales[id]);
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ortho(-width / 2, width / 2, -height / 2, height / 2, -1000, 1000);
  boundaryRadius = min(width, height) * 0.3;
}