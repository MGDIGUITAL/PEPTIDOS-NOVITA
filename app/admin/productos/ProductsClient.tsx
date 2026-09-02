'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { T } from '../components/shared';
import NewProductModal from '@/app/components/NewProductModal';
import { ToastContainer, toast } from '@/app/components/Toast';
import { deleteProduct } from '@/app/admin/actions/delete-product';

const TABLE_HEADERS = ['Producto', 'SKU', 'Categoría', 'Precio (CLP)', 'Costo (CLP)', 'Stock', 'Estado', 'Acciones'];

export default function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const router = useRouter();

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    const result = await deleteProduct(id);
    if (result.success) {
      toast({ type: 'success', message: result.message });
      router.refresh();
    } else {
      toast({ type: 'error', message: result.message });
    }
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: '16px',
        boxShadow: T.shadow,
        overflow: 'hidden'
      }}>
        {/* Table Header / Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: `1px solid ${T.border}`
        }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px', color: T.text }}>Inventario de Productos</h2>
            <p style={{ fontSize: '0.9rem', color: T.textMuted }}>
              Gestiona tu catálogo y stock. Valorización total: 
              <strong style={{ color: T.text, marginLeft: '6px' }}>
                ${initialProducts.reduce((acc, p) => acc + ((p.cost_price || 0) * (p.stock || 0)), 0).toLocaleString('es-CL')} CLP
              </strong>
            </p>
          </div>
          
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: T.primary, color: '#FFF',
              border: 'none', padding: '10px 20px', borderRadius: '10px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s ease',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.2)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.primaryHover}
            onMouseLeave={e => e.currentTarget.style.background = T.primary}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Añadir Producto
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: '#F9FAFB' }}>
              {TABLE_HEADERS.map((h, i) => (
                <th key={h} style={{
                  padding: '16px 32px',
                  textAlign: i === TABLE_HEADERS.length - 1 || i === TABLE_HEADERS.length - 2 ? 'right' : 'left',
                  color: T.textMuted,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialProducts.length === 0 ? (
              /* Empty State */
              <tr>
                <td colSpan={7} style={{ padding: '80px 32px', textAlign: 'center' }}>
                  <div style={{ color: T.border, marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: T.text, marginBottom: '8px' }}>No se encontraron productos</h3>
                  <p style={{ color: T.textMuted, fontSize: '0.9rem', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                    Tu catálogo está vacío. Haz clic en el botón "Añadir Producto" de arriba para crear tu primera joya.
                  </p>
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsModalOpen(true);
                    }}
                    style={{
                      background: 'transparent',
                      color: T.text,
                      border: `1px solid ${T.border}`,
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#F3F4F6';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    Crear Producto
                  </button>
                </td>
              </tr>
            ) : (
              initialProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '16px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.image_url ? (
                        <div style={{ width: 44, height: 44, borderRadius: '8px', overflow: 'hidden', position: 'relative', background: '#F3F4F6', border: `1px solid ${T.border}` }}>
                          <Image src={product.image_url} alt={product.title} fill style={{ objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#F3F4F6', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>🖼</span>
                        </div>
                      )}
                      <span style={{ fontWeight: 600, color: T.text, fontSize: '0.9rem' }}>{product.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 32px', color: T.textMuted, fontSize: '0.9rem' }}>{product.sku || '-'}</td>
                  <td style={{ padding: '16px 32px', color: T.textMuted, fontSize: '0.9rem' }}>
                    <span style={{ background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 32px', color: T.text, fontSize: '0.9rem', fontWeight: 500 }}>
                    ${product.sale_price?.toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '16px 32px', color: T.textMuted, fontSize: '0.9rem' }}>
                    ${(product.cost_price || 0).toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '16px 32px', color: T.textMuted, fontSize: '0.9rem' }}>
                    {product.stock === null ? 'Ilimitado' : (
                      <span style={{ 
                        color: product.stock <= 5 ? T.danger : T.text,
                        fontWeight: product.stock <= 5 ? 700 : 400,
                        background: product.stock <= 5 ? T.dangerBg : 'transparent',
                        padding: product.stock <= 5 ? '4px 8px' : '0',
                        borderRadius: '4px'
                      }}>
                        {product.stock} {product.stock <= 5 && '⚠️'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 32px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: product.status === 'active' ? T.successBg : T.dangerBg,
                      color: product.status === 'active' ? T.success : T.danger
                    }}>
                      {product.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 32px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          background: 'transparent', border: `1px solid ${T.border}`, padding: '6px 12px',
                          borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: T.text,
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 12px',
                          borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#EF4444',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewProductModal
        isOpen={isModalOpen}
        onClose={closeAndResetModal}
        productToEdit={productToEdit}
        onSuccess={() => {
          // Refresh the data when a product is created/updated
          router.refresh();
        }}
      />
      <ToastContainer />
    </div>
  );
}
