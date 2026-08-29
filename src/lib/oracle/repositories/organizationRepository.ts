import { executeQuery, getOraclePool } from '../pool';

export interface OrgMemberNode {
  memberId: string;
  userId: string;
  userName: string;
  userEmail: string;
  positionTitle: string;
  levelOrder: number;
}

export interface OrganizationDetail {
  id: string;
  name: string;
  description: string;
  totalEvents: number;
  totalMembers: number;
  members: OrgMemberNode[];
}

export async function getOrganizationStructure(organizationId: string): Promise<OrganizationDetail | null> {
  // Query Metadata Organisasi & Aggregasi
  const orgSql = `
    SELECT 
      o.id, 
      o.name, 
      o.description,
      (SELECT COUNT(1) FROM events e WHERE e.organization_id = o.id) AS total_events,
      (SELECT COUNT(1) FROM organization_members om WHERE om.organization_id = o.id) AS total_members
    FROM organizations o
    WHERE o.id = :organizationId
  `;
  
  const orgRows = await executeQuery<any>(orgSql, { organizationId });
  if (orgRows.length === 0) return null;

  const org = orgRows[0];

  // Query Members & Positions (Urut berdasarkan Level Jabatan)
  const memberSql = `
    SELECT 
      om.id AS member_id,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      COALESCE(p.title, 'Anggota') AS position_title,
      COALESCE(p.level_order, 99) AS level_order
    FROM organization_members om
    JOIN users u ON om.user_id = u.id
    LEFT JOIN positions p ON om.position_id = p.id
    WHERE om.organization_id = :organizationId
    ORDER BY p.level_order ASC, u.name ASC
  `;

  const memberRows = await executeQuery<any>(memberSql, { organizationId });

  return {
    id: org.ID,
    name: org.NAME,
    description: org.DESCRIPTION,
    totalEvents: Number(org.TOTAL_EVENTS),
    totalMembers: Number(org.TOTAL_MEMBERS),
    members: memberRows.map((m) => ({
      memberId: m.MEMBER_ID,
      userId: m.USER_ID,
      userName: m.USER_NAME,
      userEmail: m.USER_EMAIL,
      positionTitle: m.POSITION_TITLE,
      levelOrder: Number(m.LEVEL_ORDER),
    })),
  };
}
