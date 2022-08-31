export function calcFPS(vector: number[]): string {
    const AVERAGE_RECORDS_COUNT = 20;
    if (vector.length > AVERAGE_RECORDS_COUNT) {
        vector.shift();
    } else {
        return 'NaN';
    }

    let averageTime =
        vector.reduce((acc, curr) => {
            return acc + curr;
        }, 0) / AVERAGE_RECORDS_COUNT;

    return (1000 / averageTime).toFixed(2);
}


// 矩阵翻转函数；
export function flipKernel(kernel: number[][]) {
    const h = kernel.length;
    const half = Math.floor(h / 2);
    // 按中心对称的方式将矩阵中的数字上下、左右进行互换；
    for (let i = 0; i < half; ++i) {
        for (let j = 0; j < h; ++j) {
            let _t = kernel[i][j];
            kernel[i][j] = kernel[h - i - 1][h - j - 1];
            kernel[h - i - 1][h - j - 1] = _t;
        }
    }
    // 处理矩阵行数为奇数的情况；
    if (h & 1) {
        // 将中间行左右两侧对称位置的数进行互换；
        for (let j = 0; j < half; ++j) {
            let _t = kernel[half][j];
            kernel[half][j] = kernel[half][h - j - 1];
            kernel[half][h - j - 1] = _t;
        }
    }
    return kernel;
}


export function jsConvertFilter(data: Uint8ClampedArray, width: number, height: number, kernel: number[][]) {
    const divisor = 4;  // 分量调节参数；
    const h = kernel.length, w = h;  // 保存卷积核数组的宽和高；
    const half = Math.floor(h / 2);
    // 根据卷积核的大小来忽略对边缘像素的处理；
    for (let y = half; y < height - half; ++y) {
        for (let x = half; x < width - half; ++x) {
            // 每个像素点在像素分量数组中的起始位置；
            const px = (y * width + x) * 4;
            let r = 0, g = 0, b = 0;
            // 与卷积核矩阵数组进行运算；
            for (let cy = 0; cy < h; ++cy) {
                for (let cx = 0; cx < w; ++cx) {
                    // 获取卷积核矩阵所覆盖位置的每一个像素的起始偏移位置；
                    const cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4;
                    // 对卷积核中心像素点的 RGB 各分量进行卷积计算(累加)；
                    r += data[cpx + 0] * kernel[cy][cx];
                    g += data[cpx + 1] * kernel[cy][cx];
                    b += data[cpx + 2] * kernel[cy][cx];
                }
            }
            // 处理 RGB 三个分量的卷积结果；
            data[px + 0] = ((r / divisor) > 255) ? 255 : ((r / divisor) < 0) ? 0 : r / divisor;
            data[px + 1] = ((g / divisor) > 255) ? 255 : ((g / divisor) < 0) ? 0 : g / divisor;
            data[px + 2] = ((b / divisor) > 255) ? 255 : ((b / divisor) < 0) ? 0 : b / divisor;
        }
    }
    return data;
}