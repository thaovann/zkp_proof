pragma circom 2.0.0;

include "circomlib/circuits/comparators.circom";

template Lotto() {
    signal input p;    // Số bí mật 1
    signal input q;    // Số bí mật 2
    signal input n;    // Giá trị công khai (Prover đã gửi trước đó)

    signal output isWinner; // Kết quả xác minh

    // Tính tích p * q và so sánh với n
    signal computedN;
    computedN <== p * q;

    // Kiểm tra sự khác biệt giữa computedN và n
    signal diff;
    diff <== computedN - n;

    // Ràng buộc: nếu diff == 0 thì isWinner = 1, ngược lại là 0
    component checkEqual = LessThan(1);
    checkEqual.in[0] <== diff;
    checkEqual.in[1] <== 1; // So sánh nếu diff < 1 (tức là diff == 0)

    isWinner <== 1 - checkEqual.out; // Nếu diff == 0, isWinner = 1 (trúng), ngược lại 0 (không trúng)
}

component main = Lotto();