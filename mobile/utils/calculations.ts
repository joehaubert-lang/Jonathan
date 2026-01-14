export const calculateBodyFat = (
    gender: 'male' | 'female',
    age: number,
    method: 'pollock3' | 'pollock7',
    folds: {
        chest?: number;
        abdomen?: number;
        thigh?: number;
        triceps?: number;
        suprailiac?: number;
        subscapular?: number;
        axillary?: number;
    }
): { bodyFat: number; bodyDensity: number; sumFolds: number } => {
    let bodyDensity = 0;
    let sumFolds = 0;

    const sum3 = (folds.chest || 0) + (folds.abdomen || 0) + (folds.thigh || 0); // Men 3
    const sum3Fem = (folds.triceps || 0) + (folds.suprailiac || 0) + (folds.thigh || 0); // Women 3
    const sum7 =
        (folds.chest || 0) +
        (folds.axillary || 0) +
        (folds.triceps || 0) +
        (folds.subscapular || 0) +
        (folds.abdomen || 0) +
        (folds.suprailiac || 0) +
        (folds.thigh || 0);

    if (gender === 'male') {
        if (method === 'pollock3') {
            sumFolds = sum3;
            bodyDensity =
                1.10938 -
                0.0008267 * sum3 +
                0.0000016 * sum3 * sum3 -
                0.0002574 * age;
        } else {
            sumFolds = sum7;
            bodyDensity =
                1.112 -
                0.00043499 * sum7 +
                0.00000055 * sum7 * sum7 -
                0.00028826 * age;
        }
    } else {
        if (method === 'pollock3') {
            sumFolds = sum3Fem;
            bodyDensity =
                1.0994921 -
                0.0009929 * sum3Fem +
                0.0000023 * sum3Fem * sum3Fem -
                0.0001392 * age;
        } else {
            sumFolds = sum7;
            bodyDensity =
                1.097 -
                0.00046971 * sum7 +
                0.00000056 * sum7 * sum7 -
                0.00012828 * age;
        }
    }

    // Siri Equation
    const bodyFat = (4.95 / bodyDensity - 4.5) * 100;
    return { bodyFat, bodyDensity, sumFolds };
};
