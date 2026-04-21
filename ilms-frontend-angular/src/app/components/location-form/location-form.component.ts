import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSwitchModule } from '@angular/material/switch';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSwitchModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './location-form.component.html',
  styleUrl: './location-form.component.scss'
})
export class LocationFormComponent implements OnInit, OnChanges {
  @Input() code: string | null = null;
  @Output() success = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  types: any[] = [];
  cats: any[] = [];
  locations: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadMasters();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code'] && this.code) {
      this.loadData();
    }
  }

  initForm() {
    this.form = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: [''],
      category: [''],
      parentId: [''],
      address: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: [''],
      latitude: [''],
      longitude: [''],
      capacityVolume: [''],
      capacityWeight: [''],
      gln: [''],
      rfidReaderId: [''],
      isQuarantine: [false]
    });
  }

  async loadMasters() {
    try {
      const [defs, locs] = await Promise.all([
        this.apiService.getMasterDefinitions(),
        this.apiService.getRoots() // Simplified for now, should ideally get all
        // Wait, for parent selection we need all.
      ]);
      this.types = defs.filter(d => d.def_type === 'LOCATION_TYPE');
      this.cats = defs.filter(d => d.def_type === 'LOCATION_CAT');
      // For a real tree we might need a flat list. I'll add a method for that if needed.
    } catch (e) {
      console.error(e);
    }
  }

  async loadData() {
    if (this.code === 'new') {
      this.form.reset({ isQuarantine: false });
      return;
    }

    this.loading = true;
    try {
      const data = await this.apiService.getLocation(this.code!);
      this.form.patchValue(data);
    } catch (e) {
      console.error(e);
      this.snackBar.open('Failed to load location', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async handleAutoFill() {
    const unique = Math.floor(Math.random() * 1000);
    this.form.patchValue({
      code: `LOC-${unique}`,
      name: `Auto Location ${unique}`,
      type: this.types[0]?.def_value || 'WAREHOUSE',
      category: this.cats[0]?.def_value || 'GENERAL',
      address: '123 Smart St',
      city: 'Hubli',
      country: 'India'
    });
  }

  async save() {
    if (this.form.invalid) return;

    this.loading = true;
    try {
      if (this.code === 'new') {
        await this.apiService.createLocation(this.form.value);
        this.snackBar.open('Location created', 'Close', { duration: 3000 });
      } else {
        await this.apiService.updateLocation(this.code!, this.form.value);
        this.snackBar.open('Location updated', 'Close', { duration: 3000 });
      }
      this.success.emit();
    } catch (e: any) {
      console.error(e);
      this.snackBar.open(e.message || 'Save failed', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async handleDelete() {
    if (!this.code || this.code === 'new') return;
    if (confirm('Are you sure you want to delete this location?')) {
      try {
        await this.apiService.removeLocation(this.code);
        this.snackBar.open('Location deleted', 'Close', { duration: 3000 });
        this.delete.emit();
      } catch (e) {
        console.error(e);
      }
    }
  }
}
