import React, { Component, Fragment, Dispatch } from 'react';
import { TUser } from '../types';
import { filterAction } from './App';

interface IProps {
    suggestions: TUser[];
    setRepoUserFilters: Dispatch<filterAction>;
    repoToFilter: string;
}

interface IState {
    activeSuggestion: number;
    filteredSuggestions: TUser[];
    showSuggestions: boolean;
    userInput: string;
}

class Autocomplete extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            // The active selection's index
            activeSuggestion: 0,
            // The suggestions that match the user's input
            filteredSuggestions: [],
            // Whether or not the suggestion list is shown
            showSuggestions: false,
            // What the user has entered
            userInput: '',
        };
    }

    // Event fired when the input value is changed
    onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { suggestions = [] } = this.props;
        const userInput = e.currentTarget.value;

        // Filter out suggestion names or logins that don't contain the user's input
        const filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.login.toLowerCase().indexOf(userInput.toLowerCase()) > -1 ||
                (suggestion.name && suggestion.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1),
        );

        // Update the user input and filtered suggestions, reset the active
        // suggestion and make sure the suggestions are shown
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value,
        });
    };

    // Event fired when the user clicks on a suggestion
    onClick = (e: React.MouseEvent<HTMLLIElement>): void => {
        // Update the user input and reset the rest of the state
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: e.currentTarget.innerText,
        });
    };

    // Event fired when the user presses a key down
    onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        const { activeSuggestion, filteredSuggestions } = this.state;

        // User pressed the enter key, update the input and close the
        // suggestions
        if (e.keyCode === 13 && filteredSuggestions) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                filteredSuggestions: [],
                userInput: '',
            });

            this.props.setRepoUserFilters({
                type: 'addUser',
                data: {
                    repo: this.props.repoToFilter,
                    user: filteredSuggestions[activeSuggestion],
                },
            });
        }
        // User pressed the up arrow, decrement the index
        else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion - 1 });
        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion + 1 });
        }
    };

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: { activeSuggestion, filteredSuggestions, showSuggestions, userInput },
        } = this;

        let suggestionsListComponent;

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul className="suggestions">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;

                            // Flag the active suggestion with a class
                            if (index === activeSuggestion) {
                                className = 'suggestion-active';
                            }

                            return (
                                <li className={className} key={suggestion.id} onClick={onClick}>
                                    <img
                                        className="suggestion-image"
                                        src={suggestion.avatarUrl}
                                        alt={suggestion.login}
                                    />
                                    <p>
                                        {suggestion.name} <i>{suggestion.login}</i>
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                );
            } else {
                suggestionsListComponent = (
                    <div className="no-suggestions">
                        <em>No suggestions, you&apos;re on your own!</em>
                    </div>
                );
            }
        }

        return (
            <Fragment>
                <input type="text" onChange={onChange} onKeyDown={onKeyDown} value={userInput} />
                {suggestionsListComponent}
            </Fragment>
        );
    }
}

export default Autocomplete;
