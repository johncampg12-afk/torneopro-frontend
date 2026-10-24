import { Box, Typography } from '@mui/material';
import { BLACK } from '../theme';

interface Props {
  rounds: any[];
  getTeam: (id: string) => any;
}

const MATCH_H = 76;   // alto de tarjeta para partido único
const TIE_H = 112;    // alto de tarjeta para eliminatoria ida/vuelta
const MATCH_GAP = 22;
const HEADER_H = 32;
const ROUND_GAP = 60;
const COL_W = 240;

const TeamDot = ({ team }: { team: any }) =>
  team?.logo ? (
    <Box
      component="img"
      src={team.logo}
      sx={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        bgcolor: team?.color || 'rgba(17,17,17,0.1)',
        flexShrink: 0,
      }}
    />
  );

export const BracketView = ({ rounds, getTeam }: Props) => {
  const sorted = [...rounds].sort((a, b) => a.number - b.number);
  if (sorted.length === 0) return null;

  // ── Agrupa partidos en "nodos": 1 por partido si legs=1, 1 por eliminatoria si legs=2 ──
  const getRoundNodes = (round: any) => {
    const ordered = [...round.matches].sort(
      (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
    );
    if (round.legs === 2) {
      const ties: any[] = [];
      for (let i = 0; i < ordered.length; i += 2) {
        ties.push({ ida: ordered[i], vuelta: ordered[i + 1] });
      }
      return ties;
    }
    return ordered.map((m: any) => ({ single: m }));
  };

  const getNodeHeight = (round: any) => (round.legs === 2 ? TIE_H : MATCH_H);

  const getRoundContentHeight = (roundIdx: number) => {
    const nodeCount = getRoundNodes(sorted[roundIdx]).length;
    const h = getNodeHeight(sorted[roundIdx]);
    return nodeCount * h + (nodeCount - 1) * MATCH_GAP;
  };

  const contentHeight = getRoundContentHeight(0);
  const totalHeight = HEADER_H + contentHeight + 40;

  const getNodeTopY = (roundIdx: number, nodeIdx: number) => {
    const roundContentH = getRoundContentHeight(roundIdx);
    const startY = HEADER_H + 20 + (contentHeight - roundContentH) / 2;
    return startY + nodeIdx * (getNodeHeight(sorted[roundIdx]) + MATCH_GAP);
  };

  const getNodeCenterY = (roundIdx: number, nodeIdx: number) =>
    getNodeTopY(roundIdx, nodeIdx) + getNodeHeight(sorted[roundIdx]) / 2;

  // ═══════════ Render partido único (legs=1) ═══════════
  const renderSingleMatch = (match: any, roundIdx: number, nodeIdx: number) => {
    const home = match.homeTeamId ? getTeam(match.homeTeamId) : null;
    const away = match.awayTeamId ? getTeam(match.awayTeamId) : null;
    const homeWon = match.winnerId && match.winnerId === match.homeTeamId;
    const awayWon = match.winnerId && match.winnerId === match.awayTeamId;
    const topY = getNodeTopY(roundIdx, nodeIdx);

    return (
      <Box
        key={match.id}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: topY,
          height: MATCH_H,
          borderRadius: '14px',
          bgcolor: 'white',
          border: '1.5px solid',
          borderColor: match.played ? 'rgba(17,17,17,0.12)' : 'rgba(17,17,17,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Local */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.5,
            borderBottom: '1px solid rgba(17,17,17,0.06)',
            bgcolor: homeWon ? 'rgba(34,197,94,0.08)' : 'transparent',
          }}
        >
          <TeamDot team={home} />
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: homeWon ? 800 : 600,
              color: home ? BLACK : 'rgba(17,17,17,0.3)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {home?.name || 'Por definir'}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              color: homeWon ? '#16A34A' : BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
              minWidth: 20,
              textAlign: 'right',
            }}
          >
            {match.played ? match.homeScore : '–'}
          </Typography>
        </Box>

        {/* Visitante */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.5,
            bgcolor: awayWon ? 'rgba(34,197,94,0.08)' : 'transparent',
          }}
        >
          <TeamDot team={away} />
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: awayWon ? 800 : 600,
              color: away ? BLACK : 'rgba(17,17,17,0.3)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {away?.name || 'Por definir'}
          </Typography>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 800,
              color: awayWon ? '#16A34A' : BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
              minWidth: 20,
              textAlign: 'right',
            }}
          >
            {match.played ? match.awayScore : '–'}
          </Typography>
        </Box>
      </Box>
    );
  };

  // ═══════════ Render eliminatoria ida/vuelta (legs=2) ═══════════
  const renderTie = (tie: any, roundIdx: number, nodeIdx: number) => {
    const { ida, vuelta } = tie;
    const teamAId = ida?.homeTeamId || vuelta?.awayTeamId;
    const teamBId = ida?.awayTeamId || vuelta?.homeTeamId;
    const teamA = teamAId ? getTeam(teamAId) : null;
    const teamB = teamBId ? getTeam(teamBId) : null;

    const idaPlayed = !!(ida?.played && ida.homeScore !== null && ida.awayScore !== null);
    const vueltaPlayed = !!(vuelta?.played && vuelta.homeScore !== null && vuelta.awayScore !== null);
    const bothPlayed = idaPlayed && vueltaPlayed;

    // Goles de cada equipo en cada partido
    const aGoalsIda = idaPlayed ? (ida?.homeScore ?? 0) : null;
    const bGoalsIda = idaPlayed ? (ida?.awayScore ?? 0) : null;
    const bGoalsVuelta = vueltaPlayed ? (vuelta?.homeScore ?? 0) : null;
    const aGoalsVuelta = vueltaPlayed ? (vuelta?.awayScore ?? 0) : null;

    const totalA = (aGoalsIda ?? 0) + (aGoalsVuelta ?? 0);
    const totalB = (bGoalsIda ?? 0) + (bGoalsVuelta ?? 0);

    // Ganador global (mismo criterio que el backend)
    let winnerId: string | null = null;
    if (bothPlayed) {
      if (totalA > totalB) winnerId = teamAId || null;
      else if (totalB > totalA) winnerId = teamBId || null;
      else {
        const aAway = aGoalsVuelta || 0;
        const bAway = bGoalsIda || 0;
        if (aAway > bAway) winnerId = teamAId || null;
        else if (bAway > aAway) winnerId = teamBId || null;
      }
    }

    const aWon = winnerId && winnerId === teamAId;
    const bWon = winnerId && winnerId === teamBId;
    const topY = getNodeTopY(roundIdx, nodeIdx);

    return (
      <Box
        key={`tie-${ida?.id || vuelta?.id || nodeIdx}`}
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: topY,
          height: TIE_H,
          borderRadius: '14px',
          bgcolor: 'white',
          border: '1.5px solid',
          borderColor: bothPlayed ? 'rgba(17,17,17,0.12)' : 'rgba(17,17,17,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Equipos + global */}
        <Box sx={{ px: 1.25, pt: 1, pb: 0.75 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.3,
              px: 0.5,
              borderRadius: '6px',
              bgcolor: aWon ? 'rgba(34,197,94,0.08)' : 'transparent',
            }}
          >
            <TeamDot team={teamA} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: aWon ? 800 : 600,
                color: teamA ? BLACK : 'rgba(17,17,17,0.3)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {teamA?.name || 'Por definir'}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 900,
                color: aWon ? '#16A34A' : (bothPlayed ? BLACK : 'rgba(17,17,17,0.3)'),
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                minWidth: 16,
                textAlign: 'right',
              }}
            >
              {bothPlayed ? totalA : '–'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              py: 0.3,
              px: 0.5,
              borderRadius: '6px',
              bgcolor: bWon ? 'rgba(34,197,94,0.08)' : 'transparent',
            }}
          >
            <TeamDot team={teamB} />
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: bWon ? 800 : 600,
                color: teamB ? BLACK : 'rgba(17,17,17,0.3)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {teamB?.name || 'Por definir'}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 900,
                color: bWon ? '#16A34A' : (bothPlayed ? BLACK : 'rgba(17,17,17,0.3)'),
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                minWidth: 16,
                textAlign: 'right',
              }}
            >
              {bothPlayed ? totalB : '–'}
            </Typography>
          </Box>
        </Box>

        {/* Detalle ida/vuelta */}
        <Box
          sx={{
            borderTop: '1px solid rgba(17,17,17,0.06)',
            bgcolor: 'rgba(17,17,17,0.02)',
            px: 1.25,
            py: 0.6,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.3,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 10, color: 'rgba(17,17,17,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Ida
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: idaPlayed ? BLACK : 'rgba(17,17,17,0.3)',
                fontWeight: 700,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              {idaPlayed ? `${ida.homeScore} - ${ida.awayScore}` : '–'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 10, color: 'rgba(17,17,17,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Vuelta
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: vueltaPlayed ? BLACK : 'rgba(17,17,17,0.3)',
                fontWeight: 700,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              {vueltaPlayed ? `${vuelta.homeScore} - ${vuelta.awayScore}` : '–'}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ overflowX: 'auto', pb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          height: totalHeight,
          minWidth: 'min-content',
        }}
      >
        {sorted.map((round: any, ri: number) => {
          const nodes = getRoundNodes(round);
          return (
            <Box key={round.id} sx={{ display: 'flex', height: '100%' }}>
              {/* Columna */}
              <Box sx={{ width: COL_W, position: 'relative', height: '100%', flexShrink: 0 }}>
                {/* Header de ronda */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: HEADER_H,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                      color: 'rgba(17,17,17,0.4)',
                    }}
                  >
                    {round.name}
                  </Typography>
                  {round.legs === 2 && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: 9,
                        px: 0.75,
                        py: 0.15,
                        borderRadius: '999px',
                        bgcolor: 'rgba(17,17,17,0.06)',
                        color: 'rgba(17,17,17,0.5)',
                        letterSpacing: 0.3,
                        fontWeight: 700,
                        textTransform: 'none',
                      }}
                    >
                      Ida y vuelta
                    </Box>
                  )}
                </Box>

                {/* Nodos */}
                {nodes.map((node: any, nodeIdx: number) =>
                  node.single
                    ? renderSingleMatch(node.single, ri, nodeIdx)
                    : renderTie(node, ri, nodeIdx)
                )}
              </Box>

              {/* Conectores */}
              {ri < sorted.length - 1 && (
                <Box sx={{ width: ROUND_GAP, position: 'relative', height: '100%', flexShrink: 0 }}>
                  {nodes.map((_: any, ni: number) => {
                    if (ni % 2 !== 0) return null;
                    if (ni + 1 >= nodes.length) return null;
                    const y1 = getNodeCenterY(ri, ni);
                    const y2 = getNodeCenterY(ri, ni + 1);
                    const midY = (y1 + y2) / 2;
                    const lineColor = 'rgba(17,17,17,0.15)';
                    return (
                      <Box key={ni}>
                        <Box sx={{ position: 'absolute', left: 0, top: y1 - 1, width: ROUND_GAP / 2, height: 2, bgcolor: lineColor }} />
                        <Box sx={{ position: 'absolute', left: 0, top: y2 - 1, width: ROUND_GAP / 2, height: 2, bgcolor: lineColor }} />
                        <Box sx={{ position: 'absolute', left: ROUND_GAP / 2 - 1, top: y1, width: 2, height: y2 - y1, bgcolor: lineColor }} />
                        <Box sx={{ position: 'absolute', left: ROUND_GAP / 2, top: midY - 1, width: ROUND_GAP / 2, height: 2, bgcolor: lineColor }} />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};