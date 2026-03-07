import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Modal, ModalBody, Button } from 'reactstrap';
import { SHOWROOM_COMPETITION } from 'utils/api/api';
import { FaTrophy, FaTimes, FaMedal } from 'react-icons/fa';
import formatName from 'utils/formatName';
import moment from 'moment';
import 'pages/competition/competition.scss';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { BiMedal } from "react-icons/bi";

const TopCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(SHOWROOM_COMPETITION);
      setRankings(data?.rankings || []);
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetition();
  }, [fetchCompetition]);

  const formatNumber = (num) => {
    return num?.toLocaleString('id-ID') || '0';
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const getTimeSince = (dateStr) => {
    if (!dateStr) return '';
    const now = moment();
    const liveDate = moment(dateStr);
    const diffHours = now.diff(liveDate, 'hours');
    const diffDays = now.diff(liveDate, 'days');

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-badge gold';
    if (rank === 2) return 'rank-badge silver';
    if (rank === 3) return 'rank-badge bronze';
    return 'rank-badge default';
  };

  const getTrendIcon = (rankDiff) => {
    if (rankDiff > 0) return { icon: '▲', className: 'trend-up' };
    if (rankDiff < 0) return { icon: '▼', className: 'trend-down' };
    return { icon: '—', className: 'trend-neutral' };
  };

  const openDetail = (item) => {
    setSelectedMember(item);
  };

  const closeDetail = () => {
    setSelectedMember(null);
  };

  const DetailGrid = ({ live, trend }) => (
    <div className="details-grid">
      <div className="detail-item">
        <span className="detail-label">Live Count</span>
        <span className="detail-value">{live.live_count}x</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Active Days</span>
        <span className="detail-value">{live.active_days}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Total Gift</span>
        <span className="detail-value">{formatNumber(live.total_gift)}</span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Comments</span>
        <span className="detail-value">
          {formatNumber(live.total_comments)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Avg Duration</span>
        <span className="detail-value">
          {formatDuration(live.avg_duration)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Avg Gift/Live</span>
        <span className="detail-value">
          {formatNumber(live.avg_gift_per_live)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Peak Viewers</span>
        <span className="detail-value">
          {formatNumber(live.max_viewer_peak)}
        </span>
      </div>
      <div className="detail-item">
        <span className="detail-label">Pts/Live</span>
        <span className="detail-value">
          {formatNumber(live.point_per_live)}
        </span>
      </div>
      {trend?.point_diff !== undefined && (
        <div className="detail-item highlight">
          <span className="detail-label">Point Diff</span>
          <span className="detail-value trend-up">
            +{formatNumber(trend.point_diff)}
          </span>
        </div>
      )}
    </div>
  );

  // Take only top 5 rankings
  const topRankings = rankings ? rankings.slice(0, 5) : [];

  if (loading || topRankings.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="competition-page" style={{ padding: 0, paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div className="competition-header d-flex justify-content-between align-items-center mb-3">
          <div className="header-left">
            <FaTrophy className="header-trophy" />
            <h3 className="header-title m-0">
              JKT48 × SHOWROOM Competition
            </h3>
          </div>
          <Link to="/competition">
            <Button color="primary" className="btn-sm" style={{ borderRadius: '6px' }}>See All</Button>
          </Link>
        </div>

        <div className="podium-section home">
          {topRankings.map((item, idx) => {
            return (
              <div
                key={item.rank}
                className={`podium-card `}
                onClick={() => openDetail(item)}
                style={{ position: 'relative' }}
              >
                <div
                  className="podium-rank-label"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '14px',
                    backgroundColor: '#22a2b7',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 'bold',
                    zIndex: 2,
                  }}
                >
                  {item.rank}
                </div>
                <div className="podium-avatar-wrapper">
                  <img
                    src={item.room?.image_square}
                    alt={item.room?.nickname}
                    width={200}
                    className="rounded"
                  />
                </div>
                <h4 className="competition-member-name" style={{ fontSize: "18px" }}>
                  {item.room?.nickname || formatName(item.room?.name)}
                </h4>
                <h4 className="text-md font-normal" style={{ fontSize: "14px", fontWeight: "400" }}>Rank #{item.rank}</h4>
                <div className="podium-points">
                  <BiMedal size={25}  />
                  <span>{formatNumber(item.point)}</span> Pts
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedMember}
        toggle={closeDetail}
        centered
        className="competition-detail-modal"
      >
        {selectedMember && (
          <ModalBody className="competition-modal-body">
            <button className="modal-close-btn" onClick={closeDetail}>
              <FaTimes />
            </button>
            <div className="modal-header-section">
              <img
                src={selectedMember.room?.image_square}
                alt={selectedMember.room?.nickname}
                className="modal-avatar"
              />
              <div className="modal-member-info">
                <h4>
                  {selectedMember.room?.nickname ||
                    formatName(selectedMember.room?.name)}
                </h4>
                <span className="modal-rank">
                  Rank #{selectedMember.rank}
                </span>
                <div className="modal-points">
                  <FaTrophy className="modal-trophy" />
                  <span>{formatNumber(selectedMember.point)} pts</span>
                </div>
              </div>
            </div>
            {selectedMember.live && (
              <DetailGrid
                live={selectedMember.live}
                trend={selectedMember.trend}
              />
            )}
          </ModalBody>
        )}
      </Modal>
    </div>
  );
};

export default TopCompetition;
