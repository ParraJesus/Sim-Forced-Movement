//Datos de las entradas
let barra_l = 10;
let barra_m = 0;
let esfera_m = 0;
let k0 = 0;
let k1 = 0;
let k2 = 0;

//Datos Calculados
let barraPosActual = 0, barraVelActual = 0, barraAceleActual = 0;
let esferaPosActual = 0, esferaVelActual = 0, esferaAceleActual = 0;

//Datos sim
let t = 0;
let dt = 0.2;

//Colores
let bgColor = "#F0F0F0", roofColor = "#686898", barColor = "#6EAA78", ejeColor = "#fff", resorte1Color = "#F00", resorte2Color = "#0F0",
resorte3Color = "#00F", esferaColor = "#dd671e";

window.onload = function() {
    inicializarEcuaciones();
}

document.addEventListener('inputDataUpdated', function(e) {
    const inputData = e.detail;
    console.log('Datos recibidos:', inputData);
    barra_m = parseFloat(inputData.barra_masa);
    barra_l = parseFloat(inputData.barra_longitud);
    esfera_m = parseFloat(inputData.esfera_masa);
    k0 = parseFloat(inputData.k1);
    k1 = parseFloat(inputData.k2);
    k2 = parseFloat(inputData.k3);
});

document.addEventListener('startAnimation', function(e) {
    pauseAnimation();
});

function setup() {
    let canvasDiv = document.getElementById('sim_container');
    let canvas = createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
    canvas.parent('sim_container');
    windowResized();
    noLoop();
}

function windowResized() {
    let canvasDiv = document.getElementById('sim_container');
    resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
}

function draw() {
    //Cálculos del movimiento
    barraPosActual = Math.cos(t/20); //Ajusta la rotación de la barra
    esferaPosActual = 10*Math.cos(t/4); //Ajusta posición de la esfera
    //esferaPosActual =0;
    //barraPosActual=0;
    //Ajustes generales del canvas
    let drawBarLenght = barra_l*20;
    if(drawBarLenght > 200) drawBarLenght = 200; 
    background(bgColor);
    noStroke();
    strokeWeight(1);

    // Dibuja el techo y piso
    fill(roofColor);
    rect(20, 0, 600, 8); //x, y, width, height
    rect(20, 400, 600, 8);

    // Traslada el sistema de coordenadas al origen de la barra
    translate(200 + (drawBarLenght / 2) - 20, 200 + 4);

    //Obtener coordenadas del extremo derecho de la barra
    let extremoIzqBarra_x = drawBarLenght * Math.cos(barraPosActual); //Coordenada en x del extremo izquierdo de la barra
    let extremoIzqBarra_y = drawBarLenght/2 * Math.sin(barraPosActual); //Coordenada en y del extremo izquierdo de la barra

    //Dibujar resorte 1
    drawSpring(-extremoIzqBarra_x/2, -195, -(extremoIzqBarra_x/2), -extremoIzqBarra_y-5, 50, resorte1Color); //x1, y1; x2, y2, numCoils

    // Rota el sistema de coordenadas
    rotate(barraPosActual);

    // Dibuja la barra
    fill(barColor);
    rect((-drawBarLenght / 2), -10, drawBarLenght, 20);

    // Dibuja el eje de rotación
    fill(ejeColor);
    circle(0, 0, 3);

    //Rotar el sistema a la posición original
    rotate(2*Math.PI-barraPosActual);

    //Obtener coordenadas del extremo derecho de la barra
    let extremoDerBarra_x = -drawBarLenght * Math.cos(barraPosActual); //Coordenada en x del extremo izquierdo de la barra
    let extremoDerBarra_y = drawBarLenght/2 * Math.sin(barraPosActual); //Coordenada en y del extremo izquierdo de la barra
    //fill("#000");
    //circle(-extremoDerBarra_x/2, extremoDerBarra_y, 5); //Punto ref

    //Obtener coordenadas de la distancia entre el extremo derecho de la barra y el suelo
    //circle(-extremoDerBarra_x/2, 196, 5); //Punto ref

    //Obtener un punto medio entre la barra y el suelo
    let defaultPosEsfera = (extremoDerBarra_y+196)/2;
    //fill("#f00");
    //circle(-extremoDerBarra_x/2, defaultPosEsfera, 10); //Punto ref

    //Translada el sistema de coordenadas al medio exacto entre la barra y el piso
    //translate(-extremoDerBarra_x/2, defaultPosEsfera);

    //Obtener coordenadas de los extremos superior e inferior de la esfera
    let extremoSuperiorEsfera_y = defaultPosEsfera+esferaPosActual-10;
    let extremoInferiorEsfera_y = defaultPosEsfera+esferaPosActual+10;
    //fill("#ff0");
    //circle(-extremoDerBarra_x/2, extremoSuperiorEsfera_y, 5); //Punto ref
    //circle(-extremoDerBarra_x/2, extremoInferiorEsfera_y, 5); //Punto ref

    //Dibujar resorte 2
    drawSpring(-extremoDerBarra_x/2, extremoDerBarra_y, -extremoDerBarra_x/2, extremoSuperiorEsfera_y, 25, resorte2Color);//x1, y1; x2, y2, numCoils

    //Dibujar resorte 3
    drawSpring(-extremoDerBarra_x/2, extremoInferiorEsfera_y, -extremoDerBarra_x/2, 196, 25, resorte3Color);//x1, y1; x2, y2, numCoils

    //Dibujar la esfera
    fill(esferaColor);
    circle(-extremoDerBarra_x/2, esferaPosActual+defaultPosEsfera, 20);

    // Incrementa el tiempo
    t += dt;
}

function drawSpring(x1, y1, x2, y2, numCoilss, color) 
{
    //line(x1, y1, x2, y2);
    let numCoils = numCoilss;
    let springLength = dist(x1, y1, x2, y2);
    let coilSpacing = springLength / numCoils;
    
    strokeWeight(2);
    stroke(color);
    strokeJoin(ROUND);
    
    noFill();
    
    beginShape();
    for (let i = 0; i <= numCoils; i++) {
        let t = i / numCoils;
        let x = lerp(x1, x2, t);
        let y = lerp(y1, y2, t);
        if (i % 2 === 0) {
            vertex(x + 5, y);
        } else {
            vertex(x - 5, y);
        }
    }
    endShape();

    strokeWeight(1);
    noStroke();
}

function pauseAnimation()
{
    if(isLooping())
    {
        noLoop();
    }
    else
    {
        loop();
    }
}

//document.getElementById('').innerHTML = ``; //Fórmula document.getElementById('').innerHTML = ``; //Valor

function inicializarEcuaciones(){
    //Variables
    let I = 1/12*m*l**2;

    let a = I*m;
    let b = (-I*(k1 + k2) - m*(k0*l*l/4 + k1*l*l/4));
    let c = ((k0*l*l/4 + k1*l*l/4)*(k1 + k2) - Math.pow(k1*l/2, 2));
    
    let omega1 = Math.sqrt((-b + Math.sqrt(b*b - 4*a*c))/(2*a));
    let omega2 = Math.sqrt((-b - Math.sqrt(b*b - 4*a*c))/(2*a));


    //Lagrangriano
    document.getElementById('formula_lagrangiano').innerHTML = `L = (1/2)I(θ')² + (1/2)m(x')² - [(1/2)k₀(l/2θ)² + (1/2)k₁(l/2θ + x)² + (1/2)k₂x² + mgx]`; //Fórmula
    document.getElementById('formula_evaluada_lagrangiano').innerHTML = `L = `; //Valor

    //Ecuaciones Diferenciales
    document.getElementById('formula_ED_1').innerHTML = `I(θ'') + (k₀l²/4)θ + (k₁l²/4)θ + (k₁l/2)x = 0`; //Fórmula
    document.getElementById('formula_ED_2').innerHTML = `m(x'') + (k₁l/2)θ + (k₁ + k₂)x + mg = 0`; //Fórmula

    document.getElementById('formula_evaluada_ED_1').innerHTML = ``; //valor
    document.getElementById('formula_evaluada_ED_1').innerHTML = ``; //Valor
    
    //Frecuencias naturales
    document.getElementById('formula_general_frecuencia_1').innerHTML = `aω⁴ + bω² + c = 0`; //Fórmula
    
    //Fórmula de a
    document.getElementById('formula_coeficiente_a').innerHTML = `a = Lm`; //Fórmula 
    document.getElementById('formula_evaluada_coeficiente_a').innerHTML = `a = `; //Valor

    //Fórmula de b
    document.getElementById('formula_coeficiente_b').innerHTML = `b = (-I(k₁ + k₂) - m[k₀l²/4 + k₁l²/4])`; //Fórmula 
    document.getElementById('formula_evaluada_coeficiente_b').innerHTML = `b = `; //Valor

    //Fórmula de c
    document.getElementById('formula_coeficiente_c').innerHTML = `c = [k₀l²/4 + k₁l²/4](k₁ + k₂) - (k₁l/2)²`; //Fórmula 
    document.getElementById('formula_evaluada_coeficiente_c').innerHTML = `c = `; //Valor

    //Fórmula w1 y w2
    document.getElementById('formula_evaluada_frecuencia_1').innerHTML = `${omega1}`; //Valor
    document.getElementById('formula_evaluada_frecuencia_2').innerHTML = `${omega2}`; //Valor

}