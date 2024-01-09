import { useEffect, useState } from 'react';
import Notiflix from 'notiflix';
import css from '../Styles/styles.module.css';
import { requestImagesByQuery } from './Services/api';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { STATUSES } from '../Helpers/statuses';
import { Modal } from './Modal/Modal';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';

export const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(STATUSES.idle);
  const [page, setPage] = useState(1);
  const [isLoadMore, setLoadMore] = useState(false);
  const [isOpenModal, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    if (query === '') {
      return;
    }
    const addImages = async () => {
      try {
        setStatus(STATUSES.pending);
        const { hits, totalHits } = await requestImagesByQuery(query, page);
        setStatus(STATUSES.success);
        if (hits.length === 0) {
          Notiflix.Notify.failure(
            'Sorry there are no images matching your search query.'
          );
          setStatus(STATUSES.idle);
          setLoadMore(false);
          return;
        }
        setImages(prevState => [...prevState, ...hits]);
        setLoadMore(page < Math.ceil(totalHits / 12));
      } catch (error) {
        setStatus(STATUSES.error);
        Notiflix.Notify.failure(
          `An error occurred while fetching images ${error}`
        );
      }
    };
    addImages();
  }, [query, page]);

  const handleSubmit = searchQuery => {
    if (query === searchQuery) {
      return;
    }
    setQuery(searchQuery);
    setImages([]);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  const handleOpenModal = (largeImageURl, tags) => {
    setModalData({ largeImageURl, tags });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={css.App}>
      <Searchbar onSubmit={handleSubmit} />
      <ImageGallery images={images} onImageClick={handleOpenModal} />
      {status === STATUSES.pending && <Loader />}
      {isOpenModal && (
        <Modal
          isOpenModal={isOpenModal}
          onCloseModal={handleCloseModal}
          modalData={modalData}
        />
      )}

      {isLoadMore && <Button handleLoadMore={handleLoadMore} />}
    </div>
  );
};
