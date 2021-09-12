import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { Author } from './authors.entity';
import { BaseEntity } from './base.entity';
import { Category } from './categories.entity';
import { OrderItem } from './orders-item.entity';
import { ProductImage } from './product-images.entity';
import { Publisher } from './publishers.entity';

@Entity()
export class Product extends BaseEntity {
  @Column()
  title: string;

  @Column()
  publicationYear: number;

  @Column()
  pages: number;

  @Column({ default: null })
  weight: number;

  @Column()
  price: number;

  @Column()
  originalPrice: number;

  @Column()
  description: string;

  @Column({ default: true })
  inStock: boolean;

  @Column()
  categoryId: number;

  @Column()
  publisherId: number;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, { eager: true, cascade: true })
  images: ProductImage[];

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category: Category;

  @ManyToOne(() => Publisher, (publisher) => publisher.products, { eager: true })
  publisher: Publisher;

  @ManyToMany(() => Author, (author) => author.products, { eager: true })
  @JoinTable({ name: 'products_authors' })
  authors: Author[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
