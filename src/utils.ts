export function random(n: number): string {
    const choices = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const len = choices.length;

    let link = "";
    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * len);
        link += choices[randomIndex];
    }
    
    return link;
}