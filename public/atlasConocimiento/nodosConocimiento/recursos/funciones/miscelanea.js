
function cartesian2Polar(x, y) {
    const distance = Math.sqrt(x * x + y * y)
    const radians = Math.atan2(y, x) //This takes y first
    const polarCoor = { magnitud: distance, direccion: radians }
    return polarCoor
}
