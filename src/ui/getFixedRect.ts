export function getFixedRect(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const scale = rect.width / element.offsetWidth

    rect.x *= scale
    rect.y *= scale
    rect.width *= scale
    rect.height *= scale

    return rect
}