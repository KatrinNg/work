import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@material-ui/core';
import ColorButton from 'components/ColorButton/ColorButton';
import { ArrowRightAlt } from '@material-ui/icons';
import PropTypes from 'prop-types';

const CommonPagination = (props) => {
    const { rows, pageSize, pageCallbackFn } = props;

    const [currentPage, setCurrentPage] = useState(1);
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(rows?.length / pageSize); i++) {
        pageNumbers.push(i);
    }

    function ellipsis(currentPage, totalPage) {

        const arr = []
      
        if (totalPage < 8) {
          for (let i = 1; i < totalPage + 1; i++) {
            arr.push(i)
          }
        } else {
          if(currentPage < 5){
            
            for (let i = 1; i < 5 + 1; i++) {
            arr.push(i)
          }
          arr.push("...")
          arr.push(totalPage)
          } 
          else if(totalPage - currentPage <=3 ){
            arr.push(1)
            arr.push("...")
            for(let i = totalPage -4; i<= totalPage;i++ ){
              arr.push(i)
            }
          } else{
            arr.push(1)
            arr.push("...")
            for(let i = currentPage-1; i <currentPage+2;i++ ){
              arr.push(i)
            }
            arr.push("...")
            arr.push(totalPage)
          }
        }
        return arr
    }

    function pageClick(newCurrentPage) {
        setCurrentPage(newCurrentPage);
        pageCallbackFn(newCurrentPage);
    }

    useEffect(() => {
        if (currentPage !== 1) setCurrentPage(1);
    }, [pageSize]);

    useEffect(() => {
        setCurrentPage(props.currentPage);
    }, [props.currentPage]);

    return (
        <Grid style={{ display: 'flex' }}>
            <ColorButton
                id={'CommonPaginationPrevButton'}
                style={
                    pageNumbers?.length === 0 || currentPage === 1
                        ? {
                              background: '#f2f2f2',
                              color: '#b7b7b7',
                              width: '65px',
                              height: '30px',
                              borderRadius: '15px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: '6px',
                              borderColor: '#f2f2f2',
                          }
                        : {
                              background: '#3ab395',
                              color: '#ffffff',
                              width: '65px',
                              height: '30px',
                              borderRadius: '15px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: '6px',
                              borderColor: '#3ab395',
                          }
                }
                variant="contained"
                disabled={pageNumbers?.length === 0 || currentPage === 1}
                onClick={() => pageClick(currentPage - 1)}
            >
                <ArrowRightAlt style={{ transform: 'rotate(180deg)' }} />
                <Typography style={{ fontSize: '14px' }}>Prev</Typography>
            </ColorButton>
            {pageNumbers?.length > 0 &&
                ellipsis(currentPage, pageNumbers.length).map((page, index) => {
                    if (page === '...') {
                        return <div>...</div>;
                    } else {
                        return (
                            <ColorButton
                                id={'CommonPaginationPageButton'}
                                key={`pagination-${index}`}
                                style={
                                    currentPage === page
                                        ? {
                                              background: '#3ab395',
                                              color: '#ffffff',
                                              minWidth: '15px',
                                              width: '15px',
                                              height: '30px',
                                              borderRadius: '55%',
                                              marginRight: '6px',
                                              borderColor: '#3ab395',
                                              padding: 15,
                                          }
                                        : {
                                              background: 'transparent',
                                              color: '#62676a',
                                              minWidth: '15px',
                                              width: '15px',
                                              height: '30px',
                                              borderRadius: '55%',
                                              marginRight: '6px',
                                              border: '1px solid transparent',
                                              padding: 15,
                                          }
                                }
                                variant="contained"
                                onClick={() => pageClick(page)}
                            >
                                <Typography style={{ fontSize: '14px', padding: 0 }}>{page}</Typography>
                            </ColorButton>
                        );
                    }
                })}
            <ColorButton
                id={'CommonPaginationNextButton'}
                disabled={pageNumbers?.length === 0 || currentPage === pageNumbers?.length}
                style={
                    pageNumbers?.length === 0 || currentPage === pageNumbers?.length
                        ? {
                              background: '#f2f2f2',
                              color: '#b7b7b7',
                              borderColor: '#f2f2f2',
                              width: '65px',
                              height: '30px',
                              borderRadius: '15px',
                          }
                        : {
                              background: '#3ab395',
                              borderColor: '#3ab395',
                              color: '#ffffff',
                              width: '65px',
                              height: '30px',
                              borderRadius: '15px',
                          }
                }
                variant="contained"
                onClick={() => pageClick(currentPage + 1)}
            >
                <Typography style={{ fontSize: '14px' }}>Next</Typography>
                <ArrowRightAlt />
            </ColorButton>
        </Grid>
    );
};
CommonPagination.propTypes = {
    rows: PropTypes.array.isRequired,
    pageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    pageCallbackFn: PropTypes.func.isRequired,
    currentPage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CommonPagination;
