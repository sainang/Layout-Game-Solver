// =================================================================
// PROJECT: Facility Layout Challenge (Final, Fully Optimized Code)
// =================================================================


// --- 1. DOM 元素获取 (获取所有需要操作的元素) ---
const slots = document.querySelectorAll('.slot'); 
const departments = document.querySelectorAll('.department'); 
const costOutput = document.getElementById('cost-output');
const departmentPool = document.getElementById('department-pool'); 


// --- 2. 布局和流程数据 (计算引擎的核心数据) ---

// 2x3 网格的坐标映射：slot ID 对应 (R, C) 坐标
const SLOT_COORDS = {
    'slot-1': { r: 1, c: 1 }, 'slot-2': { r: 1, c: 2 }, 'slot-3': { r: 1, c: 3 },
    'slot-4': { r: 2, c: 1 }, 'slot-5': { r: 2, c: 2 }, 'slot-6': { r: 2, c: 3 },
};

// 严格单向流量矩阵 (只包含图像中显示的 10 条单向流量)
const FLOW_MATRIX = [
    /* To -> 1,  2,   3,   4,   5,   6  */
    /* From 1 */ [0, 50, 100,  0,   0,  20],
    /* From 2 */ [0,  0,  30, 50,  10,  0],
    /* From 3 */ [0,  0,  0,  20,  0, 100], 
    /* From 4 */ [0,  0,  0,  0,  50,  0],
    /* From 5 */ [0,  0,  0,  0,  0,   0],
    /* From 6 */ [0,  0,  0,  0,  0,  0],
];


// --- 3. 距离与成本函数 ---

// 曼哈顿距离计算函数
function calculateDistance(coord1, coord2) {
    return Math.abs(coord1.r - coord2.r) + Math.abs(coord1.c - coord2.c);
}

// 成本因子函数：相邻/斜相邻=1，其他=2
function getCostFactor(distance, coordI, coordJ) {
    if (distance === 0) return 0; 
    
    if (distance === 1) {
        return 1;
    } 

    if (distance === 2) {
        const rowDiff = Math.abs(coordI.r - coordJ.r);
        const colDiff = Math.abs(coordI.c - coordJ.c);
        
        if (rowDiff === 1 && colDiff === 1) {
            return 1; // 斜相邻成本为 1
        }
    }
    
    return 2; 
}


// --- 4. 主计算函数 (每次放置后触发) ---

function updateAndCalculateLayout() {
    let totalCost = 0;
    
    const deptLocation = {}; 
    slots.forEach(slot => {
        if (slot.children.length > 0) {
            const deptId = slot.children[0].dataset.deptId;
            deptLocation[parseInt(deptId)] = slot.id; 
        }
    });

    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 6; j++) {
            if (i === j) continue;

            if (deptLocation[i] && deptLocation[j]) {
                const flow = FLOW_MATRIX[i - 1][j - 1]; 
                
                if (flow > 0) {
                    const coordI = SLOT_COORDS[deptLocation[i]];
                    const coordJ = SLOT_COORDS[deptLocation[j]];

                    const distance = calculateDistance(coordI, coordJ);
                    const costFactor = getCostFactor(distance, coordI, coordJ); 
                    
                    totalCost += flow * costFactor;
                }
            }
        }
    }

    costOutput.textContent = totalCost.toFixed(0); 
    console.log(`新布局的总成本: ${totalCost}`);
}


// --- 5. 拖放事件处理 ---

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.setData('text/plain', e.target.dataset.deptId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault(); 
}

function handleUniversalDrop(e) {
    e.preventDefault();
    const target = e.currentTarget;

    if (!draggedElement) return;

    if (target.classList.contains('slot')) {
        const originalSlot = draggedElement.parentNode;

        if (target.children.length === 0) {
            target.appendChild(draggedElement);
        } else {
            const targetElement = target.children[0];
            target.appendChild(draggedElement);
            originalSlot.appendChild(targetElement);
        }

    } else if (target.id === 'department-pool') {
        target.appendChild(draggedElement); 
    }
    
    updateAndCalculateLayout();
}


// --- 6. 监听器初始化 ---

document.addEventListener('DOMContentLoaded', () => {
    departments.forEach(dept => {
        dept.setAttribute('draggable', true);
        dept.addEventListener('dragstart', handleDragStart);
        dept.addEventListener('dragend', handleDragEnd);
    });

    slots.forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleUniversalDrop);
    });
    
    departmentPool.addEventListener('dragover', handleDragOver);
    departmentPool.addEventListener('drop', handleUniversalDrop);
});
