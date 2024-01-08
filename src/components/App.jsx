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

// export class App extends Component {
//   state = {
//     images: [],
//     status: STATUSES.idle,
//     query: '',
//     error: null,
//     isLoadMore: false,
//     isOpenModal: false,
//     modalData: [],
//     page: 1,
//     isEmpty: false,
//   };

//   async componentDidUpdate(_, prevState) {
//     const { page, query } = this.state;
//     if (page !== prevState.page || prevState.query !== query) {
//       try {
//         this.setState({ status: STATUSES.pending });
//         const { hits, totalHits } = await requestImagesByQuery(query, page);
//         this.setState(prevState => ({
//           images: [...prevState.images, ...hits],
//           isLoadMore: this.state.page < Math.ceil(totalHits / 12),
//           status: STATUSES.success,
//         }));
//       } catch (error) {
//         this.setState({ error: error.message, status: STATUSES.error });
//       }
//     }
//   }

//   handleSubmit = query => {
//     if (this.state.query === query) {
//       return;
//     }
//     this.setState({ query: query, images: [], page: 1 });
//   };

//   handleLoadMore = () => {
//     this.setState(prevState => ({
//       page: prevState.page + 1,
//     }));
//   };

//   handleOpenModal = (largeImageURl, tags) => {
//     this.setState({
//       modalData: { largeImageURl, tags },
//       isOpenModal: true,
//     });
//   };

//   handleCloseModal = () => {
//     this.setState({
//       isOpenModal: false,
//     });
//   };
//   render() {
//     const { isLoadMore, isOpenModal, status } = this.state;
//     return (
//       <div className={css.App}>
//         <Searchbar onSubmit={this.handleSubmit} />
//         <ImageGallery
//           images={this.state.images}
//           onImageClick={this.handleOpenModal}
//         />
//         {status === STATUSES.pending && <Loader />}
//         {isOpenModal && (
//           <Modal
//             isOpenModal={isOpenModal}
//             onCloseModal={this.handleCloseModal}
//             modalData={this.state.modalData}
//           />
//         )}

//         {isLoadMore && <Button handleLoadMore={this.handleLoadMore} />}
//       </div>
//     );
//   }
// }

export const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(STATUSES.idle);
  const [error, setError] = useState(null);
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
      } catch (errorMessage) {
        setError(error);
        setStatus(STATUSES.error);
        Notiflix.Notify.failure(
          `${errorMessage} please wait a few minutes before you try again`
        );
      }
    };
    addImages();
  }, [query, page, error]);

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
