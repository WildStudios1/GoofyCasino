document.addEventListener('DOMContentLoaded', () => {
    let coins = localStorage.getItem('coins') ? parseInt(localStorage.getItem('coins')) : 200;
    const coinsElement = document.getElementById('coins');
    const resultElement = document.getElementById('result');

    // Sound Elements
    const rouletteSound = document.getElementById('roulette-sound');
    const slotsSound = document.getElementById('slots-sound');
    const winSound = document.getElementById('win-sound');
    const loseSound = document.getElementById('lose-sound');

    // Three.js initialization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Cube setup
    const cubeSize = 2;
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Define textures for the sides
    const numbers = [' ', ' ', 1, 2, 3, 4];
    const materials = numbers.map(num => new THREE.MeshBasicMaterial({ map: createNumberTexture(num) }));

    // Create cubes with textures
    const cubes = [];
    const positions = [-4, 0, 4];
    for (let i = 0; i < 3; i++) {
        const cube = new THREE.Mesh(geometry, materials);
        cube.position.x = positions[i];
        scene.add(cube);
        cubes.push(cube);
    }

    // Create wireframe for cubes
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.5;
    line.material.transparent = true;

    cubes.forEach(cube => {
        cube.add(line.clone()); // Add a wireframe to each cube
    });

    camera.position.z = 10;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    function updateCoins(amount) {
        coins += amount;
        coinsElement.innerText = coins;
        localStorage.setItem('coins', coins);
    }

    function playRoulette() {
        if (coins < 10) {
            alert('Not enough coins to play Backshot Roulette!');
            return;
        }

        updateCoins(-10);
        rouletteSound.play();

        // Simulate spinning
        setTimeout(() => {
            const result = Math.random() < 0.17 ? 'win' : 'lose'; // 1/6 chance to win
            const message = result === 'win' ? 'You won 20 coins!' : 'You lost!';
            if (result === 'win') {
                winSound.play();
                updateCoins(20);
            } else {
                loseSound.play();
            }
            resultElement.innerText = message;
        }, 2000); // 2-second delay
    }

    function playSlots() {
        if (coins < 5) {
            alert('Not enough coins to play Quandale Slots!');
            return;
        }

        updateCoins(-5);
        slotsSound.play();

        // Generate random rotations
        const possibleAngles = [0, 90, 180, 270];
        const results = [];
        const rotations = [];

        for (let i = 0; i < 3; i++) {
            const randomAngle = possibleAngles[Math.floor(Math.random() * possibleAngles.length)];
            results.push(randomAngle);
            rotations.push(randomAngle);
        }

        // Update the cubes with the results
        cubes.forEach((cube, index) => {
            cube.rotation.x = THREE.MathUtils.degToRad(rotations[index]);
        });

        // Spin the cubes quickly
        const spinDuration = 500; // Duration of spin
        const startAngles = cubes.map(cube => cube.rotation.x);
        let startTime = Date.now();

        const spinInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / spinDuration, 1);

            cubes.forEach((cube, index) => {
                const spinAngle = rotations[index] + 360 * progress;
                cube.rotation.x = THREE.MathUtils.degToRad(spinAngle % 360);
            });

            if (progress === 1) {
                clearInterval(spinInterval);
                const allSame = rotations.every(angle => angle === rotations[0]);
                let message = `Slots: `;
                if (allSame) {
                    message += 'You hit the jackpot! 50 coins!';
                    winSound.play();
                    updateCoins(50);
                } else {
                    message += 'Better luck next time!';
                    loseSound.play();
                }
                resultElement.innerText = message;
            }
        }, 16); // Update every 16 ms (60 fps)
    }

    function createNumberTexture(number) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (number !== '') {
            context.fillStyle = '#fff';
            context.font = 'bold 120px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(number, canvas.width / 2, canvas.height / 2);
        }
        return new THREE.CanvasTexture(canvas);
    }

    window.playRoulette = playRoulette;
    window.playSlots = playSlots;

    coinsElement.innerText = coins;
});