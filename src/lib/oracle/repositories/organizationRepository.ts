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

// Type buat hasil DB
type DbOrgRow = {
  id: string;
  name: string;
  description: string;
  total_events: number;
  total_members: number;
}

type DbMemberRow = {
  member_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  position_title: string;
  level_order: number;
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
  
  const orgRows = await executeQuery(orgSql, { organizationId }) as DbOrgRow[]; // HAPUS <any>
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

  const memberRows = await executeQuery(memberSql, { organizationId }) as DbMemberRow[]; // HAPUS <any>

  return {
    id: org.id, // GANTI JADI lowercase
    name: org.name,
    description: org.description,
    totalEvents: Number(org.total_events),
    totalMembers: Number(org.total_members),
    members: memberRows.map((m) => ({
      memberId: m.member_id, // lowercase
      userId: m.user_id,
      userName: m.user_name,
      userEmail: m.user_email,
      positionTitle: m.position_title,
      levelOrder: Number(m.level_order),
    })),
  };
}
