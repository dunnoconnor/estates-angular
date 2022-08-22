import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Die } from './die';
@Component({
  selector: 'app-die',
  templateUrl: './die.component.html',
  styleUrls: ['./die.component.css']
})
export class DieComponent {
  @Input() die: Die | null = null;
  @Output() edit = new EventEmitter<Die>();
}
