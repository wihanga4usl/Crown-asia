import { Modal, Descriptions, Divider, Image, Tag, Row, Col } from "antd";

export default function AdminSaleDetailsModal({ sale, open, onClose }) {
  if (!sale) return null;

  const statusColor =
    sale.status === "APPROVED"
      ? "green"
      : sale.status === "REJECTED"
      ? "red"
      : "orange";

  const formatDate = (ts) => {
    if (!ts) return "-";
    if (ts.seconds) {
      return new Date(ts.seconds * 1000).toLocaleDateString();
    }
    return "-";
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      title="Sale – Full Details"
    >
      {/* ================= CUSTOMER DETAILS ================= */}
      <Divider orientation="left">Customer Details</Divider>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Full Name">
          {sale.fullName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Name with Initials">
          {sale.initialsName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="NIC">
          {sale.nicNumber || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Date of Birth">
          {formatDate(sale.dob)}
        </Descriptions.Item>
        <Descriptions.Item label="Nationality">
          {sale.nationality || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Marital Status">
          {sale.maritalStatus || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Gender">
          {sale.gender || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Occupation">
          {sale.occupation || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Permanent Address" span={2}>
          {sale.address || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Mobile">
          {sale.phone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {sale.email || "-"}
        </Descriptions.Item>
      </Descriptions>

      {/* ================= EMPLOYMENT DETAILS ================= */}
      <Divider orientation="left">Employment Details</Divider>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Employment Type">
          {sale.employmentType || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Employer Name">
          {sale.employerName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Employer Address" span={2}>
          {sale.employerAddress || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Years of Employment">
          {sale.yearsOfEmployment ?? "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Monthly Income">
          Rs. {Number(sale.monthlyIncome || 0).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      {/* ================= INVESTMENT DETAILS ================= */}
      <Divider orientation="left">Investment Details</Divider>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Plan Name">
          {sale.planName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Investment Amount">
          Rs. {Number(sale.investmentAmount || 0).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Investment Period">
          {sale.investmentPeriod || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Expected Return">
          {sale.expectedReturn || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Method">
          {sale.paymentMethod || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Date">
          {formatDate(sale.paymentDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={statusColor}>{sale.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Approved At">
          {formatDate(sale.approvedAt)}
        </Descriptions.Item>
      </Descriptions>

      {/* ================= BANK DETAILS ================= */}
      <Divider orientation="left">Bank Details</Divider>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Bank Name">
          {sale.bankName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Branch">
          {sale.branchName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Account Holder Name">
          {sale.accountHolder || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Account Number">
          {sale.accountNumber || "-"}
        </Descriptions.Item>
      </Descriptions>

      {/* ================= NOMINEE DETAILS ================= */}
      <Divider orientation="left">Nominee Details</Divider>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="Nominee Name">
          {sale.nomineeName || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nominee NIC">
          {sale.nomineeNic || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Relationship">
          {sale.nomineeRelationship || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nominee Phone">
          {sale.nomineePhone || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nominee Address" span={2}>
          {sale.nomineeAddress || "-"}
        </Descriptions.Item>
      </Descriptions>

      {/* ================= DOCUMENTS ================= */}
      <Divider orientation="left">Documents</Divider>
      <Row gutter={16}>
        <Col>
          {sale.nicFrontUrl ? (
            <Image width={260} src={sale.nicFrontUrl} />
          ) : (
            <Tag color="red">NIC Front Missing</Tag>
          )}
        </Col>

        <Col>
          {sale.nicBackUrl ? (
            <Image width={260} src={sale.nicBackUrl} />
          ) : (
            <Tag color="red">NIC Back Missing</Tag>
          )}
        </Col>

        <Col>
          {sale.signatureUrl ? (
            <Image width={260} src={sale.signatureUrl} />
          ) : (
            <Tag color="orange">Signature Not Uploaded</Tag>
          )}
        </Col>
      </Row>
    </Modal>
  );
}