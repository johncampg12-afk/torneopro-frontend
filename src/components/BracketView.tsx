import { Box, Typography } from '@mui/material';
import { BLACK } from '../theme';

interface Props {
  rounds: any[];
  getTeam: (id: string) => any;
}

const MATCH_H = 76;
const MATCH_GAP = 20;
const HEADER_H = 32;
const ROUND_GAP = 60;
const COL_W = 220;

export const BracketView = ({ rounds, getTeam }: Props) => {
  const sorted = [...rounds].sort((a, b) => a.number - b.number);
  if (sorted.length === 0) return null;

  const firstRoundMatches = sorted[0].matches.length || 1;
  const contentHeight =
    firstRoundMatches * MATCH_H + (firstRoundMatches - 1) * MATCH_GAP;
  const totalHeight = HEADER_H + contentHeight + 40;

  const getMatchCenterY = (roundIdx: number, matchIdx: number) => {
    const matchesInRound = sorted[roundIdx].matches.length;
    const roundContentH =
      matchesInRound * MATCH_H + (matchesInRound - 1) * MATCH_GAP;
    const startY = HEADER_H + 20 + (contentHeight - roundContentH) / 2;
    return startY + matchIdx * (MATCH_H + MATCH_GAP) + MATCH_H / 2;
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
        {sorted.map((round: any, ri: number) => (
          <Box key={round.id} sx={{ display: 'flex', height: '100%' }}>
            {/* Columna de partidos */}
            <Box sx={{ width: COL_W, position: 'relative', height: '100%', flexShrink: 0 }}>
              <Typography
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: HEADER_H,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  color: 'rgba(17,17,17,0.4)',
                }}
              >
                {round.name}
              </Typography>

              {round.matches.map((match: any, mi: number) => {
                const home = match.homeTeamId ? getTeam(match.homeTeamId) : null;
                const away = match.awayTeamId ? getTeam(match.awayTeamId) : null;
                const topY = getMatchCenterY(ri, mi) - MATCH_H / 2;
                const homeWon = match.winnerId && match.winnerId === match.homeTeamId;
                const awayWon = match.winnerId && match.winnerId === match.awayTeamId;

                return (
                  <Box
                    key={match.id}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: topY,
                      height: MATCH_H,
                      borderRadius: '12px',
                      bgcolor: 'white',
                      border: '1.5px solid rgba(17,17,17,0.08)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Local */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        borderBottom: '1px solid rgba(17,17,17,0.06)',
                        bgcolor: homeWon ? 'rgba(34,197,94,0.08)' : 'transparent',
                      }}
                    >
                      {home?.logo ? (
                        <Box
                          component="img"
                          src={home.logo}
                          sx={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: home?.color || 'rgba(17,17,17,0.1)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 600,
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
                        gap: 1,
                        px: 1.5,
                        bgcolor: awayWon ? 'rgba(34,197,94,0.08)' : 'transparent',
                      }}
                    >
                      {away?.logo ? (
                        <Box
                          component="img"
                          src={away.logo}
                          sx={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: away?.color || 'rgba(17,17,17,0.1)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 600,
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
                        }}
                      >
                        {match.played ? match.awayScore : '–'}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Conectores entre rondas */}
            {ri < sorted.length - 1 && (
              <Box sx={{ width: ROUND_GAP, position: 'relative', height: '100%', flexShrink: 0 }}>
                {round.matches.map((_: any, mi: number) => {
                  if (mi % 2 !== 0) return null;
                  if (mi + 1 >= round.matches.length) return null;
                  const y1 = getMatchCenterY(ri, mi);
                  const y2 = getMatchCenterY(ri, mi + 1);
                  const midY = (y1 + y2) / 2;
                  const lineColor = 'rgba(17,17,17,0.15)';
                  return (
                    <Box key={mi}>
                      {/* Horizontal desde local */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: y1 - 1,
                          width: ROUND_GAP / 2,
                          height: 2,
                          bgcolor: lineColor,
                        }}
                      />
                      {/* Horizontal desde visitante */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: y2 - 1,
                          width: ROUND_GAP / 2,
                          height: 2,
                          bgcolor: lineColor,
                        }}
                      />
                      {/* Vertical */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: ROUND_GAP / 2 - 1,
                          top: y1,
                          width: 2,
                          height: y2 - y1,
                          bgcolor: lineColor,
                        }}
                      />
                      {/* Horizontal hacia siguiente ronda */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: ROUND_GAP / 2,
                          top: midY - 1,
                          width: ROUND_GAP / 2,
                          height: 2,
                          bgcolor: lineColor,
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};