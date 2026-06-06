import axios from "axios";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Col, Row } from "reactstrap";
import { FcSearch } from "react-icons/fc";
import { MdPlayCircleFilled, MdCalendarToday } from "react-icons/md";
import { RiUserLine } from "react-icons/ri";
import { FaCommentDots } from "react-icons/fa";
import MainLayout from "../layout/MainLayout";
import Pagination from "parts/Pagination";
import debounce from "lodash.debounce";
import "./ReplayList.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

const REPLAY_API_URL = "https://jkt48.gemes.in/replay/data/videos.json";

const ReplayList = (props) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [platformFilter, setPlatformFilter] = useState("all");
  const perPage = 9;
  const navigate = useHistory();

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        const response = await axios.get(REPLAY_API_URL);
        setVideos(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
    window.document.title = "Replay Live Streaming JKT48";
  }, []);

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setSearch(searchTerm);
      setPage(1);
    }, 500),
    []
  );

  const handleSearch = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredVideos = useMemo(() => {
    let result = videos;

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(searchLower) ||
          video.member.toLowerCase().includes(searchLower)
      );
    }

    if (platformFilter !== "all") {
      result = result.filter(
        (video) => video.platform.toLowerCase() === platformFilter.toLowerCase()
      );
    }

    return result;
  }, [videos, search, platformFilter]);

  const totalCount = filteredVideos.length;
  const paginatedVideos = filteredVideos.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalCount);

  const getYouTubeThumbnail = (youtubeId) => {
    return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
  };

  const handleVideoClick = (video) => {
    navigate.push(`/replay/${video.member.toLowerCase()}/${video.youtube_id}`, { video });
  };

  return (
    <MainLayout
      {...props}
      title="Replay Live Streaming JKT48"
      description="Tonton replay live streaming member JKT48"
    >
      <div className="layout">
        <div className="replay-header">
          <h3 className="replay-title">
            Replay Live
          </h3>
        </div>

        <Row className="d-flex align-items-center mb-3">
          <div className="col-md-5 col-sm-12 search-wrapper">
            <FcSearch className="search-bar" color="#03665c" size="1.5em" />
            <input
              style={{ width: "100%", padding: "1rem 1rem 1rem 3rem" }}
              type="text"
              placeholder="Cari member atau judul..."
              onChange={handleSearch}
              className="form-control replay-search-input"
            />
          </div>
          <div className="col-md-3 col-sm-12 replay-filter-buttons">
            <button
              className={`replay-filter-btn ${platformFilter === "all" ? "active" : ""}`}
              onClick={() => {
                setPlatformFilter("all");
                setPage(1);
              }}
            >
              All
            </button>
            <button
              className={`replay-filter-btn ${platformFilter === "IDN" ? "active" : ""}`}
              onClick={() => {
                setPlatformFilter("IDN");
                setPage(1);
              }}
            >
              IDN
            </button>
            <button
              className={`replay-filter-btn ${platformFilter === "Showroom" ? "active" : ""}`}
              onClick={() => {
                setPlatformFilter("Showroom");
                setPage(1);
              }}
            >
              Showroom
            </button>
          </div>
          <div className="col-md-3 col-sm-12">
            {totalCount > 0 && (
              <p className="replay-showing-text">
                Menampilkan {startIndex}-{endIndex} dari {totalCount} video
              </p>
            )}
          </div>
        </Row>


        {loading ? (
          <Row>
            {[...Array(9)].map((_, idx) => (
              <Col key={idx} sm="6" md="4" className="py-3">
                <div className="replay-card-skeleton">
                  <div className="skeleton-thumbnail" />
                  <div className="skeleton-content">
                    <div className="skeleton-title" />
                    <div className="skeleton-meta" />
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : paginatedVideos.length === 0 ? (
          <div className="replay-empty">
            <MdPlayCircleFilled size={64} className="replay-empty-icon" />
            <p>Tidak ada replay video untuk member tersebut</p>
          </div>
        ) : (
          <Row>
            {paginatedVideos.map((video, idx) => (
              <Col key={idx} sm="6" md="4" className="py-3">
                <div
                  className="replay-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="replay-card-thumbnail-wrapper">
                    <img
                      src={getYouTubeThumbnail(video.youtube_id)}
                      alt={video.title}
                      className="replay-card-thumbnail"
                      loading="lazy"
                    />
                    <div className="replay-card-play-overlay">
                      <MdPlayCircleFilled className="replay-play-icon" />
                    </div>
                    <div className="replay-card-platform-badge">
                      {video.platform}
                    </div>
                  </div>

                  <div className="replay-card-body">
                    <h5 className="replay-card-title">{video.title}</h5>
                    <div className="replay-card-meta">
                      <span className="replay-card-member">
                        <RiUserLine className="replay-meta-icon" />
                        {video.member}
                      </span>
                      <span className="replay-card-date">
                        <MdCalendarToday className="replay-meta-icon" />
                        {video.date}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {totalCount > perPage && (
          <div className="replay-bottom-pagination">
            <Pagination
              page={page}
              perPage={perPage}
              totalCount={totalCount}
              setPage={setPage}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReplayList;
