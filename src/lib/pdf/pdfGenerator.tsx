import React from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from './InvoiceTemplate';

// Default company information - this can be moved to environment variables or database
const DEFAULT_COMPANY_INFO = {
  name: 'Elevate Real Estate Management',
  address: 'Business Bay, Sheikh Zayed Road',
  city: 'Dubai, United Arab Emirates',
  phone: '+971 4 123 4567',
  email: 'info@elevate-realestate.com',
  website: 'www.elevate-realestate.com',
  // logo: '/images/company-logo.png', // Optional: Add logo path
};

export interface InvoicePDFData {
  // Invoice details
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  notes?: string;
  
  // Agreement and related data
  agreement: {
    id: string;
    agreementNumber: string;
    rentAmount: number;
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    property: {
      id: string;
      name: string;
      address: string;
    };
    rentalUnit: {
      id: string;
      unitNumber: string;
      unitType: {
        name: string;
      };
    };
  };
}

export class PDFGeneratorService {
  /**
   * Generate and download invoice PDF
   */
  static async generateInvoicePDF(
    invoiceData: InvoicePDFData, 
    companyInfo = DEFAULT_COMPANY_INFO
  ): Promise<void> {
    try {
      // Transform the data to match the template interface
      const templateData = {
        // Invoice details
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        amount: invoiceData.amount,
        taxAmount: invoiceData.taxAmount,
        totalAmount: invoiceData.totalAmount,
        description: invoiceData.description,
        notes: invoiceData.notes,
        
        // Company details
        company: companyInfo,
        
        // Tenant details
        tenant: {
          firstName: invoiceData.agreement.tenant.firstName,
          lastName: invoiceData.agreement.tenant.lastName,
          email: invoiceData.agreement.tenant.email,
          phone: invoiceData.agreement.tenant.phone,
        },
        
        // Property details
        property: {
          name: invoiceData.agreement.property.name,
          address: invoiceData.agreement.property.address,
        },
        
        // Rental unit details
        rentalUnit: {
          unitNumber: invoiceData.agreement.rentalUnit.unitNumber,
          unitType: {
            name: invoiceData.agreement.rentalUnit.unitType.name,
          },
        },
        
        // Agreement details
        agreement: {
          agreementNumber: invoiceData.agreement.agreementNumber,
          rentAmount: invoiceData.agreement.rentAmount,
        },
      };

      // Generate PDF blob
      const blob = await pdf(<InvoiceTemplate data={templateData} />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceData.invoiceNumber}_${invoiceData.agreement.tenant.firstName}_${invoiceData.agreement.tenant.lastName}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  /**
   * Generate PDF blob without downloading (for preview or email)
   */
  static async generateInvoicePDFBlob(
    invoiceData: InvoicePDFData,
    companyInfo = DEFAULT_COMPANY_INFO
  ): Promise<Blob> {
    try {
      const templateData = {
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: invoiceData.status,
        amount: invoiceData.amount,
        taxAmount: invoiceData.taxAmount,
        totalAmount: invoiceData.totalAmount,
        description: invoiceData.description,
        notes: invoiceData.notes,
        company: companyInfo,
        tenant: {
          firstName: invoiceData.agreement.tenant.firstName,
          lastName: invoiceData.agreement.tenant.lastName,
          email: invoiceData.agreement.tenant.email,
          phone: invoiceData.agreement.tenant.phone,
        },
        property: {
          name: invoiceData.agreement.property.name,
          address: invoiceData.agreement.property.address,
        },
        rentalUnit: {
          unitNumber: invoiceData.agreement.rentalUnit.unitNumber,
          unitType: {
            name: invoiceData.agreement.rentalUnit.unitType.name,
          },
        },
        agreement: {
          agreementNumber: invoiceData.agreement.agreementNumber,
          rentAmount: invoiceData.agreement.rentAmount,
        },
      };

      return await pdf(<InvoiceTemplate data={templateData} />).toBlob();
    } catch (error) {
      console.error('Error generating PDF blob:', error);
      throw new Error('Failed to generate PDF blob.');
    }
  }

  /**
   * Open PDF in new tab for preview
   */
  static async previewInvoicePDF(
    invoiceData: InvoicePDFData,
    companyInfo = DEFAULT_COMPANY_INFO
  ): Promise<void> {
    try {
      const blob = await this.generateInvoicePDFBlob(invoiceData, companyInfo);
      const url = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
      
      // Cleanup URL after a delay to allow the new tab to load
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (error) {
      console.error('Error previewing PDF:', error);
      throw new Error('Failed to preview PDF. Please try again.');
    }
  }

  /**
   * Batch generate multiple invoices
   */
  static async generateBatchInvoicePDFs(
    invoicesData: InvoicePDFData[],
    companyInfo = DEFAULT_COMPANY_INFO
  ): Promise<void> {
    try {
      const promises = invoicesData.map(async (invoiceData, index) => {
        // Add a small delay between each PDF generation to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, index * 100));
        return this.generateInvoicePDF(invoiceData, companyInfo);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error generating batch PDFs:', error);
      throw new Error('Failed to generate some PDFs. Please try again.');
    }
  }

  /**
   * Validate invoice data before PDF generation
   */
  static validateInvoiceData(data: InvoicePDFData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.invoiceNumber) errors.push('Invoice number is required');
    if (!data.issueDate) errors.push('Issue date is required');
    if (!data.dueDate) errors.push('Due date is required');
    if (!data.agreement?.tenant?.firstName) errors.push('Tenant first name is required');
    if (!data.agreement?.tenant?.lastName) errors.push('Tenant last name is required');
    if (!data.agreement?.tenant?.email) errors.push('Tenant email is required');
    if (!data.agreement?.property?.name) errors.push('Property name is required');
    if (!data.agreement?.rentalUnit?.unitNumber) errors.push('Unit number is required');
    
    // Numeric validation
    if (data.amount < 0) errors.push('Amount cannot be negative');
    if (data.taxAmount < 0) errors.push('Tax amount cannot be negative');
    if (data.totalAmount < 0) errors.push('Total amount cannot be negative');
    
    // Date validation
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);
    if (dueDate < issueDate) errors.push('Due date cannot be before issue date');

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default PDFGeneratorService; 