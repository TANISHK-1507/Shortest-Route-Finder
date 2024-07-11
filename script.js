let blocks = document.getElementsByClassName("drawing-area")[0];
let addEdge = false;
let cnt = 0;
let dist;
let alerted = localStorage.getItem("alerted") || "";
if (alerted !== "yes") {
    alert(
        "Read Instructions before proceeding by clicking i-icon in the top right corner."
    );
    localStorage.setItem("alerted", "yes");
}

// It is called when user starts adding edges by clicking on button given
const addEdges = () => {
    if (cnt < 2) {
        alert("create at least 2 nodes to add an edge");
        return;
    }
    addEdge = true;
    document.getElementById("add-edge-enable").disabled = true;
    document.getElementsByClassName("run-btn")[0].disabled = false;

    // Initializing array for adjacency matrix representation
    dist = new Array(cnt).fill(Infinity).map(() => new Array(cnt).fill(Infinity));
};

// Temporary array to store clicked elements to make an edge between them (max size = 2)
let arr = [];
const appendBlock = (x, y) => {
    document.querySelector(".reset-btn").disabled = false;
    document.querySelector(".click-instructions").style.display = "none";

    // creating a node
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.top = `${y}px`;
    block.style.left = `${x}px`;
    block.style.transform = 'translate(-50%, -50%)';
    block.id = cnt;

    block.innerText = cnt++;

    // Click event for node
    block.addEventListener("click", (e) => {
        e.stopPropagation();

        if (!addEdge) return;
        block.style.backgroundColor = "coral";
        arr.push(block.id);

        if (arr.length == 2) {
            drawUsingId(arr);
            arr = [];
        }
    });
    blocks.appendChild(block);
};

// Allow creating nodes on screen by clicking
blocks.addEventListener("click", (e) => {
    if (addEdge) return;
    if (cnt > 12) {
        alert("cannot add more than 12 vertices");
        return;
    }
    appendBlock(e.clientX, e.clientY);
});

// Function to draw a line between nodes
const drawLine = (x1, y1, x2, y2, ar) => {
    if (dist[Number(ar[0])][Number(ar[1])] !== Infinity) {
        document.getElementById(ar[0]).style.backgroundColor = "#333";
        document.getElementById(ar[1]).style.backgroundColor = "#333";
        return;
    }

    console.log(ar);

    const len = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    const slope = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

    dist[Number(ar[0])][Number(ar[1])] = Math.round(len / 10);
    dist[Number(ar[1])][Number(ar[0])] = Math.round(len / 10);

    const line = document.createElement("div");
    line.id = Number(ar[0]) < Number(ar[1]) ? `line-${ar[0]}-${ar[1]}` : `line-${ar[1]}-${ar[0]}`;

    line.classList.add("line");
    line.style.width = `${len}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${slope}deg)`;
    line.style.transformOrigin = "0 0";

    // Edge weight
    let p = document.createElement("p");
    p.classList.add("edge-weight");
    p.innerText = Math.round(len / 10);
    p.contentEditable = "true";
    p.inputMode = "numeric";
    p.addEventListener("blur", (e) => {
        if (isNaN(Number(e.target.innerText))) {
            alert("Enter valid edge weight");
            return;
        }
        let n1 = Number(p.closest(".line").id.split("-")[1]);
        let n2 = Number(p.closest(".line").id.split("-")[2]);

        dist[n1][n2] = Number(e.target.innerText);
        dist[n2][n1] = Number(e.target.innerText);
    });

    line.append(p);
    blocks.appendChild(line);
};

const drawUsingId = (ar) => {
    if (ar[0] === ar[1]) {
        document.getElementById(ar[0]).style.backgroundColor = '#333';
        return;
    }
    const node1 = document.getElementById(ar[0]);
    const node2 = document.getElementById(ar[1]);
    const x1 = parseInt(node1.style.left) + node1.offsetWidth / 2;
    const y1 = parseInt(node1.style.top) + node1.offsetHeight / 2;
    const x2 = parseInt(node2.style.left) + node2.offsetWidth / 2;
    const y2 = parseInt(node2.style.top) + node2.offsetHeight / 2;

    drawLine(x1, y1, x2, y2, ar);
};

const findShortestPath = (e1) => {
    let visited = [];
    let unvisited = [];
    clearScreen();

    let source = Number(e1.previousElementSibling.value);
    if (source >= cnt || isNaN(source)) {
        alert("Invalid Source");
        return;
    }
    document.getElementById(source).style.backgroundColor = "grey";

    let parent = [];
    parent[source] = -1;
    visited = [];
    for (let i = 0; i < cnt; i++) unvisited.push(i);

    // Array Containing cost of reaching i(th) node from the source
    let cost = [];
    for (let i = 0; i < cnt; i++) {
        i === source ? null : dist[source][i] ? (cost[i] = dist[source][i]) : (cost[i] = Infinity);
    }
    cost[source] = 0;

    // Array which will contain final minimum cost
    let mincost = [];
    mincost[source] = 0;

    // Repeating until all edges are visited
    while (unvisited.length) {
        let mini = cost.indexOf(Math.min(...cost));

        visited.push(mini);
        unvisited.splice(unvisited.indexOf(mini), 1);

        // Relaxation of unvisited edges
        for (let j of unvisited) {
            if (j === mini) continue;
            if (cost[j] > dist[mini][j] + cost[mini]) {
                mincost[j] = dist[mini][j] + cost[mini];
                cost[j] = dist[mini][j] + cost[mini];
                parent[j] = mini;
            } else {
                mincost[j] = cost[j];
            }
        }
        cost[mini] = Infinity;
    }
    console.log("Minimum Cost", mincost);
    for (let i = 0; i < cnt; i++)
        parent[i] === undefined ? (parent[i] = source) : null;
    indicatePath(parent, source);
};

const indicatePath = async (parentArr, src) => {
    document.getElementsByClassName("path")[0].innerHTML = "";
    for (let i = 0; i < cnt; i++) {
        let p = document.createElement("p");
        p.innerText = "Node" + i + "--->" + src;
        await printPath(parentArr, i, p);
    }
};

const printPath = async (parent, j, el_p) => {
    if (parent[j] === -1) return;
    await printPath(parent, parent[j], el_p);
    el_p.innerText = el_p.innerText + " " + j;

    document.getElementsByClassName("path")[0].style.padding = "1rem";
    document.getElementsByClassName("path")[0].appendChild(el_p);

    if (j < parent[j]) {
        let tmp = document.getElementById(`line-${j}-${parent[j]}`);
        await colorEdge(tmp);
    } else {
        let tmp = document.getElementById(`line-${parent[j]}-${j}`);
        await colorEdge(tmp);
    }
};

const colorEdge = async (el) => {
    if (el.style.backgroundColor !== "aqua") {
        await wait(1000);
        el.style.backgroundColor = "aqua";
        el.style.height = "8px";
    }
};

const clearScreen = () => {
    document.getElementsByClassName("path")[0].innerHTML = "";
    let lines = document.getElementsByClassName("line");
    for (let line of lines) {
        line.style.backgroundColor = "#EEE";
        line.style.height = "5px";
    }
};

const resetDrawingArea = () => {
    blocks.innerHTML = "";

    const p = document.createElement("p");
    p.classList.add("click-instruction");
    p.innerHTML = "Click to create Node";

    blocks.appendChild(p);
    document.getElementById("add-edge-enable").disabled = false;
    document.querySelector(".reset-btn").disabled = true;
    document.getElementsByClassName("path")[0].innerHTML = "";

    cnt = 0;
    dist = [];
    addEdge = false;
};

const wait = async (t) => {
    let pr = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done!");
        }, t);
    });
    res = await pr;
};