'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { InvoiceWithItems } from '@/types/invoice'
import { sanitizeTextForPDF } from './font-utils'

// フォント登録状態を管理
let fontRegistered = false

// 日本語フォントを登録する関数
const registerJapaneseFont = (): boolean => {
  if (fontRegistered) return true

  // フォント登録を無効化（エラーを回避）
  console.log('Font registration disabled for stability')
  fontRegistered = true
  return false // 常にフォールバックフォントを使用
}

// PDFスタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica', // 常にHelveticaを使用
    fontSize: 10,
    lineHeight: 1.4,
  },
  // ヘッダー
  header: {
    marginBottom: 20,
    textAlign: 'right',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    lineHeight: 1.3,
  },
  // タイトル
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  // 請求先・請求書情報セクション
  infoSection: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  billingInfo: {
    flex: 1,
    marginRight: 20,
  },
  invoiceInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #ccc',
    paddingBottom: 3,
  },
  billingName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
  },
  infoValue: {
    flex: 1,
  },
  // 明細テーブル
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    border: '1 solid #000',
    padding: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: '1 solid #000',
    borderRight: '1 solid #000',
    borderBottom: '1 solid #000',
    padding: 5,
    minHeight: 20,
  },
  colNo: {
    width: 40,
    textAlign: 'center',
  },
  colItem: {
    flex: 2,
    paddingRight: 5,
  },
  colQuantity: {
    width: 60,
    textAlign: 'right',
    paddingRight: 5,
  },
  colUnit: {
    width: 40,
    textAlign: 'center',
  },
  colUnitPrice: {
    width: 80,
    textAlign: 'right',
    paddingRight: 5,
  },
  colAmount: {
    width: 100,
    textAlign: 'right',
    paddingRight: 5,
  },
  // 金額サマリー
  summary: {
    width: 250,
    alignSelf: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottom: '1 solid #ccc',
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    border: '2 solid #000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  // フッター
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #ccc',
    fontSize: 9,
    color: '#666',
  },
})


interface InvoicePDFProps {
  invoice: InvoiceWithItems
  companyInfo: {
    company_name: string
    postal_code?: string
    address?: string
    phone?: string
    email?: string
    fax?: string
  } | null
}

export function InvoicePDF({ invoice, companyInfo }: InvoicePDFProps) {
  // フォント登録を無効化（安定性のため）
  console.log('PDF generation with system fonts only')

  // 金額のフォーマット
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount)
  }

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 小計・税額・合計の計算
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
  const tax = Math.floor(subtotal * 0.1)
  const total = subtotal + tax

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー：自社情報 */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {sanitizeTextForPDF(companyInfo?.company_name || '株式会社サンプル')}
          </Text>
          <View style={styles.companyInfo}>
            {companyInfo?.postal_code && companyInfo?.address && (
              <Text>〒{companyInfo.postal_code}</Text>
            )}
            {companyInfo?.address && (
              <Text>{companyInfo.address}</Text>
            )}
            {companyInfo?.phone && (
              <Text>TEL: {companyInfo.phone}</Text>
            )}
            {companyInfo?.email && (
              <Text>Email: {companyInfo.email}</Text>
            )}
          </View>
        </View>

        {/* タイトル */}
        <Text style={styles.title}>請求書</Text>

        {/* 請求先・請求書情報 */}
        <View style={styles.infoSection}>
          {/* 請求先情報 */}
          <View style={styles.billingInfo}>
            <Text style={styles.sectionTitle}>請求先</Text>
            <Text style={styles.billingName}>
              {sanitizeTextForPDF(`${invoice.billing_name} ${invoice.billing_honorific}`)}
            </Text>
            {invoice.billing_address && (
              <Text>{invoice.billing_address}</Text>
            )}
          </View>

          {/* 請求書情報 */}
          <View style={styles.invoiceInfo}>
            <Text style={styles.sectionTitle}>請求書情報</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>請求書番号:</Text>
              <Text style={styles.infoValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>発行日:</Text>
              <Text style={styles.infoValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
          </View>
        </View>

        {/* 明細テーブル */}
        <View style={styles.table}>
          {/* テーブルヘッダー */}
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No.</Text>
            <Text style={styles.colItem}>品目名</Text>
            <Text style={styles.colQuantity}>数量</Text>
            <Text style={styles.colUnit}>単位</Text>
            <Text style={styles.colUnitPrice}>単価</Text>
            <Text style={styles.colAmount}>金額</Text>
          </View>

          {/* テーブル行 */}
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colItem}>{item.item_name}</Text>
              <Text style={styles.colQuantity}>{item.quantity.toLocaleString()}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colUnitPrice}>{item.unit_price.toLocaleString()}円</Text>
              <Text style={styles.colAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* 金額サマリー */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>小計:</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>消費税 (10%):</Text>
            <Text>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text>合計:</Text>
            <Text>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text>この度は誠にありがとうございました。</Text>
          <Text>お支払いは請求書発行日より30日以内にお願いいたします。</Text>
        </View>
      </Page>
    </Document>
  )
}