import { calcFPS, flipKernel, jsConvertFilter, loadWasm, wasmConvertFilter } from './dip';
import './style.css'

document.addEventListener('DOMContentLoaded', async () => {
  const STATUS = ['NONE', 'JS', 'WASM'] as const;
  let globalStatus: typeof STATUS[number] = 'NONE';
  document.querySelector<HTMLButtonElement>('button')?.addEventListener('click', () => {
    const checkedRadio = document.querySelector<HTMLInputElement>(`input[name='options']:checked`);
    globalStatus = checkedRadio ? STATUS[+checkedRadio?.value] : 'NONE';
  });

  let video = document.querySelector<HTMLVideoElement>('.video') as HTMLVideoElement;
  let canvas = document.querySelector<HTMLCanvasElement>('.canvas') as HTMLCanvasElement;
  let context2d = canvas?.getContext('2d') as CanvasRenderingContext2D;
  let fps = document.querySelector<HTMLSpanElement>('.fps-num') as HTMLSpanElement;
  let jsTimeRecords: number[] = [];
  let wasmTimeRecords: number[] = [];
  let clientX = 0;
  let clientY = 0;

  const KERNEL = flipKernel([
    [-1, -1, 1],
    [-1, 14, -1],
    [1, -1, -1],
  ]);

  let promise = video?.play();
  if (promise !== undefined) {
    promise.catch(() => console.error('video can not play'))
  }

  video.addEventListener('loadeddata', () => {
    canvas?.setAttribute('width', `${video?.videoWidth}`);
    canvas?.setAttribute('height', `${video?.videoHeight}`);

    clientX = canvas.clientWidth;
    clientY = canvas.clientHeight;

    draw(context2d, video);
  });

// wasm filter
  let instance = await loadWasm();

  function draw(context2d: CanvasRenderingContext2D, video: HTMLVideoElement) {
    const timeStart = performance.now();

    context2d.drawImage(video, 0, 0);
    const pixels = context2d.getImageData(0, 0, video.videoWidth, video.videoHeight);

    switch (globalStatus) {
      case 'JS':
        pixels.data.set(jsConvertFilter(pixels.data, clientX, clientY, KERNEL));
        break;

      case 'WASM':
        pixels.data.set(wasmConvertFilter(instance, KERNEL, pixels.data, clientX, clientY)());
        break;

      default:
        break;
    }

    context2d.putImageData(pixels, 0, 0);

    let timeUsed = performance.now() - timeStart;

    // update fps
    switch (globalStatus) {
      case 'JS':
        jsTimeRecords.push(timeUsed);
        fps.innerHTML = calcFPS(jsTimeRecords);
        break;

      case 'WASM':
        wasmTimeRecords.push(timeUsed);
        fps.innerHTML = calcFPS(wasmTimeRecords);
        break;

      default:
        fps.innerHTML = '60';
        break;
    }

    requestAnimationFrame(() => draw(context2d, video));
  }
})

