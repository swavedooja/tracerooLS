import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { MaterialDetailCardComponent } from '../material-detail-card/material-detail-card.component';

@Component({
  selector: 'app-material-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MaterialDetailCardComponent
  ],
  templateUrl: './material-create.component.html',
  styleUrl: './material-create.component.scss'
})
export class MaterialCreateComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  generalForm!: FormGroup;
  dimensionsForm!: FormGroup;
  storageForm!: FormGroup;
  packagingForm!: FormGroup;
  identifiersForm!: FormGroup;
  flagsForm!: FormGroup;
  
  images: any[] = [];
  saving = false;
  loading = false;
  code: string | null = null;
  mode: 'create' | 'edit' | 'view' = 'create';

  TYPES = ['Finished Goods', 'Raw Material', 'Packaging Material'];
  STATES = ['Liquid', 'Solid', 'Gel', 'Powder'];
  CLASSES = ['Bottles', 'Tubes', 'Jars', 'Cartons'];
  GROUPS = ['Shampoo', 'Fairness Cream', 'Body Wash', 'Hand Sanitizer'];
  STORAGE_TYPES = ['Ambient', 'Cool Storage', 'Cold Storage'];
  PROCUREMENT_TYPES = ['Make To Stock', 'Make To Order', 'Purchase'];
  VEHICLE_TYPES = ['Bulker', 'Tanker', 'Flatbed', 'Refrigerated Truck', 'Standard Container'];
  UOMS = ['EA', 'KG', 'LT', 'TON', 'ML', 'GM'];
  PACKAGING_MATERIAL_OPTIONS = ['Box', 'Carton', 'Wooden Crate', 'Premium Wrap', 'Shrink Wrap'];
  SKU_TYPE_OPTIONS = ['Bottle', 'Tube', 'Jar', 'Sachet', 'Box', 'Carton', 'Other'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initForms();
    this.route.params.subscribe(params => {
      this.code = params['code'];
      if (this.code) {
        this.mode = (this.route.snapshot.queryParams['mode'] as any) || 'edit';
        this.loadMaterial(this.code);
      } else {
        this.mode = 'create';
      }
    });
  }

  async loadMaterial(code: string) {
    this.loading = true;
    try {
      const data = await this.apiService.getMaterial(code);
      this.patchForms(data);
    } catch (e) {
      console.error('Failed to load material', e);
      this.snackBar.open('Failed to load material details', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  patchForms(data: any) {
    this.generalForm.patchValue({
      materialCode: data.code,
      materialName: data.name,
      description: data.description,
      type: data.type,
      materialClass: data.class,
      materialGroup: data.category,
      materialState: data.state,
      countryOfOrigin: data.countryOfOrigin
    });

    this.dimensionsForm.patchValue({
      baseUOM: data.baseUom,
      netWeightKg: data.netWeight,
      netWeightUom: data.weightUom,
      lengthMM: data.length,
      widthMM: data.width,
      heightMM: data.height,
      dimensionUom: data.dimensionUom
    });

    this.flagsForm.patchValue({
      isBatchManaged: !!data.isBatchManaged,
      isSerialized: !!data.isSerialManaged
    });

    if (data.images) {
      this.images = data.images.map((img: any) => ({
        name: img.filename || 'Image',
        dataUrl: img.url,
        isPrimary: img.type === 'MAIN'
      }));
    }
  }

  initForms() {
    this.generalForm = this.fb.group({
      materialCode: ['', Validators.required],
      materialName: ['', Validators.required],
      description: [''],
      countryOfOrigin: [''],
      type: ['', Validators.required],
      materialClass: ['', Validators.required],
      materialGroup: ['', Validators.required],
      materialState: ['']
    });

    this.dimensionsForm = this.fb.group({
      baseUOM: ['', Validators.required],
      netWeightKg: [''],
      netWeightUom: ['KG'],
      lengthMM: [''],
      widthMM: [''],
      heightMM: [''],
      dimensionUom: ['MM'],
      tradeUOM: [''],
      tradeWeightKg: [''],
      tradeWeightUom: ['KG'],
      tradeLengthMM: [''],
      tradeWidthMM: [''],
      tradeHeightMM: [''],
      tradeDimensionUom: ['MM']
    });

    this.storageForm = this.fb.group({
      shelfLifeDays: [''],
      storageType: [''],
      procurementType: [''],
      vehicleType: [''],
      temperatureMin: [''],
      temperatureMax: [''],
      humidityMin: [''],
      humidityMax: [''],
      hazardousClass: [''],
      epcFormat: [''],
      envParameters: [''],
      precautions: ['']
    });

    this.packagingForm = this.fb.group({
      packagingTypes: [[]],
      skus: this.fb.array([])
    });

    this.identifiersForm = this.fb.group({
      materialEANupc: [''],
      upc: [''],
      externalERPCode: [''],
      packagingMaterialCode: ['']
    });

    this.flagsForm = this.fb.group({
      isPackaged: [false],
      isFragile: [false],
      isHighValue: [false],
      isEnvSensitive: [false],
      isBatchManaged: [false],
      isSerialized: [false]
    });
  }

  get skus() {
    return this.packagingForm.get('skus') as FormArray;
  }

  addSku() {
    const sku = this.fb.group({
      name: [''],
      type: [''],
      packagingMaterial: [''],
      quantity: [1],
      length: [''],
      width: [''],
      height: [''],
      dimUom: ['MM'],
      weight: [''],
      weightUom: ['KG']
    });
    this.skus.push(sku);
  }

  removeSku(index: number) {
    this.skus.removeAt(index);
  }

  handleImageUpload(event: any) {
    if (this.mode === 'view') return;
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt: any) => {
        this.images.push({
          name: file.name,
          dataUrl: evt.target.result,
          isPrimary: this.images.length === 0
        });
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  }

  removeImage(index: number) {
    if (this.mode === 'view') return;
    const isPrimary = this.images[index].isPrimary;
    this.images.splice(index, 1);
    if (isPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }

  setPrimaryImage(index: number) {
    if (this.mode === 'view') return;
    this.images.forEach((img, i) => img.isPrimary = i === index);
  }

  handleAutoFill() {
    const unique = Math.floor(Math.random() * 1000);
    this.generalForm.patchValue({
      materialCode: `MAT-${unique}`,
      materialName: `Auto Material ${unique}`,
      description: 'Auto-generated material for testing',
      countryOfOrigin: 'India',
      type: this.TYPES[0],
      materialClass: this.CLASSES[0],
      materialGroup: this.GROUPS[0],
      materialState: this.STATES[0]
    });

    this.dimensionsForm.patchValue({
      baseUOM: 'EA',
      netWeightKg: 0.5,
      netWeightUom: 'KG',
      lengthMM: 50,
      widthMM: 50,
      heightMM: 150,
      dimensionUom: 'MM'
    });

    this.flagsForm.patchValue({
      isBatchManaged: true,
      isPackaged: true
    });
  }

  get fullFormValue() {
    return {
      ...this.generalForm.value,
      ...this.dimensionsForm.value,
      ...this.storageForm.value,
      ...this.packagingForm.value,
      ...this.identifiersForm.value,
      ...this.flagsForm.value,
      images: this.images.map(img => img.dataUrl)
    };
  }

  async submit() {
    if (this.generalForm.invalid) {
      this.snackBar.open('Please complete the general section.', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;
    try {
      const formVal = this.fullFormValue;
      const payload = {
        code: formVal.materialCode,
        name: formVal.materialName,
        description: formVal.description,
        type: formVal.type,
        category: formVal.materialGroup,
        baseUom: formVal.baseUOM,
        isBatchManaged: formVal.isBatchManaged,
        isSerialManaged: formVal.isSerialized,
        shelfLifeDays: formVal.shelfLifeDays ? Number(formVal.shelfLifeDays) : null,
        grossWeight: formVal.tradeWeightKg ? Number(formVal.tradeWeightKg) : null,
        netWeight: formVal.netWeightKg ? Number(formVal.netWeightKg) : null,
        weightUom: formVal.netWeightUom || 'KG',
        length: formVal.lengthMM ? Number(formVal.lengthMM) : null,
        width: formVal.widthMM ? Number(formVal.widthMM) : null,
        height: formVal.heightMM ? Number(formVal.heightMM) : null,
        dimensionUom: formVal.dimensionUom || 'MM',
        status: 'ACTIVE'
      };

      if (this.mode === 'create') {
        await this.apiService.createMaterial(payload);
        this.snackBar.open('Material created successfully!', 'Close', { duration: 3000 });
      } else {
        await this.apiService.updateMaterial(this.code!, payload);
        this.snackBar.open('Material updated successfully!', 'Close', { duration: 3000 });
      }
      this.router.navigate(['/materials']);
    } catch (e: any) {
      console.error(e);
      this.snackBar.open(e.message || 'Failed to process material', 'Close', { duration: 5000 });
    } finally {
      this.saving = false;
    }
  }

  openPreview(template: any) {
    this.dialog.open(template, {
      width: '1000px',
      maxWidth: '95vw'
    });
  }

  switchMode(newMode: 'edit' | 'view') {
    this.mode = newMode;
  }
}
