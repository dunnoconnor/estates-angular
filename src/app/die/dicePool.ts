import { Die } from "./die";

class DieClass {
    value: number;
    color: string;

    constructor(value: number, color:string) {
      this.value = value;
      this.color = color;
    }
}

const dicePool : Die[] = []
const colors : string[] = ["red", "yellow", "green", "blue", "purple", "grey"]

for(let index in colors){ 
    for (let i = 1; i <= 6; i++) {
        dicePool.push({value:i,color:colors[index]})
    }
}

console.log(dicePool)

