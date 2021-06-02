import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { forkJoin, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AttributeInputMode } from '../../../shared/Enums/attributes.enum';
import { ProductStatus, SellerProductStatus } from '../../../shared/Enums/products.enum';
import { Attribute } from '../../../shared/Interfaces/attribute.interface';
import { Author } from '../../../shared/Interfaces/author.interface';
import { Product } from '../../../shared/Interfaces/product.interface';
import { Publisher } from '../../../shared/Interfaces/publisher.interface';
import { AuthorsService } from '../authors.service';
import { CategoriesService } from '../categories.service';
import { ProductsService } from '../products.service';
import { PublishersService } from '../publishers.service';

@Component({
  selector: 'app-products-detail',
  templateUrl: './products-detail.component.html',
  styleUrls: ['./products-detail.component.scss']
})
export class ProductsDetailComponent implements OnInit {
  productForm: FormGroup;
  attributeForm: FormGroup;
  product: Product;
  categoryTree: NzTreeNodeOptions[] = [];
  publishers: Publisher[];
  authors: Author[];
  fileList: NzUploadFile[] = [];
  productStatus = SellerProductStatus;
  attributes: Attribute[] = [];

  removedFileList: number[] = [];
  shopId: number;
  productId: number;
  isNew = true;
  isLoading = false;
  isBtnLoading = false;
  fileSizeLimit = 500;
  fileTypeLimit = 'image/jpg,image/jpeg,image/png,image/gif';

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private authorsService: AuthorsService,
    private publishersService: PublishersService,
    private messageService: NzMessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required]],
      pages: ['', [Validators.required]],
      weight: ['', [Validators.required]],
      publicationYear: ['', [Validators.required]],
      price: ['', [Validators.required]],
      originalPrice: ['', [Validators.required]],
      description: ['', [Validators.required]],
      status: [''],
      categoryId: ['', [Validators.required]],
      publisherId: ['', [Validators.required]],
      authorIds: [[], [Validators.required]]
    });

    this.attributeForm = this.fb.group({});

    this.renderDependencies();

    this.activatedRoute.params.subscribe(({ shopId, productId }) => {
      this.shopId = shopId;
      this.productId = productId;

      this.isNew = productId === 'new';
      if (!this.isNew) this.renderProductDetailPage();
      else {
        this.productForm.reset();
        this.attributes = [];
        this.attributeForm = this.fb.group({});
        this.fileList = [];
      }
    });
  }

  renderProductDetailPage() {
    this.isLoading = true;
    this.productsService.getOne(this.shopId, this.productId).subscribe(
      (response) => {
        this.product = response;
        this.productForm.setValue({
          title: this.product.title,
          pages: this.product.pages,
          weight: this.product.weight,
          publicationYear: this.product.publicationYear,
          price: this.product.price,
          originalPrice: this.product.originalPrice,
          description: this.product.description,
          status: this.product.status,
          categoryId: this.product?.category?.id || '',
          publisherId: this.product?.publisher?.id || '',
          authorIds: this.product.authors.map((author) => author.id)
        });

        if (this.product.status === ProductStatus.BANNED) {
          this.productForm.controls['status'].disable();
          this.productStatus = ProductStatus as any;
        }

        this.changeCategoryAttributes(this.product.category.id);

        this.fileList = this.product.images.map((image) => ({
          uid: String(image.id),
          status: 'done',
          name: image.imgName,
          url: image.imgUrl
        }));

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.messageService.error(error?.error?.message);
      }
    );
  }

  renderDependencies() {
    this.isLoading = true;
    forkJoin([
      this.categoriesService.getMany(),
      this.publishersService.getMany(),
      this.authorsService.getMany()
    ]).subscribe(
      (response) => {
        [this.categoryTree, this.publishers, this.authors] = response;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.messageService.error(error?.error?.message);
      }
    );
  }

  changeCategoryAttributes(categoryId: number) {
    this.categoriesService.getManyAttributes(categoryId).subscribe((response) => {
      this.attributes = response;
      const withData = !this.isNew && this.product.category.id === categoryId;
      this.renderAttributeForm(withData);
    });
  }

  renderAttributeForm(withData = false) {
    const controls: { [key: string]: any } = {};

    this.attributes.forEach((attribute) => {
      const defaultInputMode = attribute.inputMode === AttributeInputMode.DEFAULT;
      let formControlValue: any = defaultInputMode ? '' : [];

      if (withData) {
        const productAttribute = this.product.attributes.find((attr) => attr.id === attribute.id);
        if (productAttribute) {
          if (defaultInputMode) formControlValue = productAttribute.attributeValues[0].id;
          else formControlValue = productAttribute.attributeValues.map((attributeValue) => attributeValue.id);
        }
      }

      controls[attribute.name] = new FormControl(
        formControlValue,
        attribute.isRequired ? Validators.required : null
      );
    });

    this.attributeForm = this.fb.group(controls);
  }

  createNewAttributeValue(attributeValue: string, attributeId: number) {
    const categoryId = this.productForm.controls['categoryId'].value;
    this.categoriesService
      .createAttributeValue(categoryId, attributeId, { value: attributeValue })
      .pipe(
        switchMap((response) => this.categoriesService.getOneAttribute(categoryId, attributeId)),
        catchError((error) => throwError(error))
      )
      .subscribe(
        (response) => {
          const attributeIndex = this.attributes.findIndex((attribute) => attribute.id === attributeId);
          this.attributes[attributeIndex] = response;
        },
        (error) => this.messageService.error(error?.error?.message)
      );
  }

  update() {
    this.isBtnLoading = true;
    this.productsService.updateOne(this.shopId, this.product.id, this.createFormData()).subscribe(
      (response) => {
        this.isBtnLoading = false;
        this.messageService.success('Cập nhật thành công!');
        this.goBack();
      },
      (error) => {
        this.isBtnLoading = false;
        this.messageService.error(error?.error?.message);
      }
    );
  }

  create() {
    this.isBtnLoading = true;
    this.productsService.createOne(this.shopId, this.createFormData()).subscribe(
      (response) => {
        this.isBtnLoading = false;
        this.messageService.success('Thêm mới thành công!');
        this.goBack();
      },
      (error) => {
        this.isBtnLoading = false;
        this.messageService.error(error?.error?.message);
      }
    );
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    this.productForm.markAsDirty();
    return false;
  };

  handleUploadEventChange(info: NzUploadChangeParam): void {
    if (info.type === 'removed' && info.file.url && !this.isNew) {
      this.removedFileList.push(Number(info.file.uid));
      this.productForm.markAsDirty();
    }
  }

  createFormData(): FormData {
    const formData = new FormData();

    for (const formControl in this.productForm.value) {
      formData.append(formControl, this.productForm.value[formControl]);
    }

    formData.append(
      'attributeValueIds',
      Object.values(this.attributeForm.value).flat().filter(Boolean) as any
    );

    if (this.fileList.length)
      this.fileList.forEach((file: NzUploadFile) => {
        if (!file.url) formData.append('attachment', file as any);
      });

    if (this.removedFileList.length) {
      formData.append('removedImageIds', this.removedFileList as any);
    }

    return formData;
  }

  goBack() {
    this.location.back();
  }
}
