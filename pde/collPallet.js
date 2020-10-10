const CPallet = {
    pallet : (i) => {
        return ([color(10, 35, 66), color(255, 219, 112), color(239, 118, 123), color(163, 109, 143), color(247, 240, 234)][round(i)])
    },

    palletLight : (i) => {
        return ([color(77, 95, 117), color(255, 228, 151), color(244, 155, 159), color(188, 148, 174), color(248, 243, 239)][round(i)])
    },

    palletDark : (i) => {
        return ([color(8, 26, 50), color(186, 160, 83), color(175, 86, 90), color(119, 81, 106), color(179, 174, 170)][round(i)])
    }
}