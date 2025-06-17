import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface InvoiceData {
  // Invoice details
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  description?: string;
  notes?: string;
  
  // Company details
  company: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    website?: string;
    logo?: string;
  };
  
  // Tenant details
  tenant: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Property details
  property: {
    name: string;
    address: string;
  };
  
  // Rental unit details
  rentalUnit: {
    unitNumber: string;
    unitType: {
      name: string;
    };
  };
  
  // Agreement details
  agreement: {
    agreementNumber: string;
    rentAmount: number;
  };
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

// PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 3,
  },
  boldText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    padding: 5,
  },
  footer: {
    marginTop: 20,
    borderTop: 1,
    borderTopColor: '#000',
    paddingTop: 10,
  },
});

// PDF Document component
const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{data.company.name}</Text>
            <Text style={styles.text}>{data.company.address}</Text>
            <Text style={styles.text}>{data.company.city}</Text>
            <Text style={styles.text}>{data.company.phone}</Text>
            <Text style={styles.text}>{data.company.email}</Text>
          </View>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.boldText}>Invoice #: {data.invoiceNumber}</Text>
            <Text style={styles.text}>Issue Date: {data.issueDate}</Text>
            <Text style={styles.text}>Due Date: {data.dueDate}</Text>
            <Text style={styles.text}>Status: {data.status}</Text>
          </View>
        </View>

        {/* Bill To Section */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Bill To:</Text>
          <Text style={styles.boldText}>
            {data.tenant.firstName} {data.tenant.lastName}
          </Text>
          <Text style={styles.text}>{data.tenant.email}</Text>
          {data.tenant.phone && (
            <Text style={styles.text}>{data.tenant.phone}</Text>
          )}
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Property Details:</Text>
          <Text style={styles.text}>Property: {data.property.name}</Text>
          <Text style={styles.text}>Address: {data.property.address}</Text>
          <Text style={styles.text}>
            Unit: {data.rentalUnit.unitNumber} ({data.rentalUnit.unitType.name})
          </Text>
          <Text style={styles.text}>
            Agreement: {data.agreement.agreementNumber}
          </Text>
        </View>

        {/* Invoice Details Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Amount</Text>
            <Text style={styles.tableCell}>Tax</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              {data.description || `Rent for Unit ${data.rentalUnit.unitNumber}`}
            </Text>
            <Text style={styles.tableCell}>AED {data.amount.toFixed(2)}</Text>
            <Text style={styles.tableCell}>AED {data.taxAmount.toFixed(2)}</Text>
            <Text style={styles.tableCell}>AED {data.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.section}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.text}>Subtotal: AED {data.amount.toFixed(2)}</Text>
            <Text style={styles.text}>Tax: AED {data.taxAmount.toFixed(2)}</Text>
            <Text style={styles.boldText}>
              Total Amount: AED {data.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Notes:</Text>
            <Text style={styles.text}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.text}>
            Thank you for your business! Payment is due by {data.dueDate}.
          </Text>
          <Text style={styles.text}>
            For questions, please contact us at {data.company.email}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate; 